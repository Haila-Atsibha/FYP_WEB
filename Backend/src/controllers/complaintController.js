const pool = require('../db');

exports.createComplaint = async (req, res) => {
    try {
        const userId = req.user.id;
        const { subject, description, priority = 'medium', booking_id, provider_id } = req.body;

        if (!subject || !description) {
            return res.status(400).json({ message: "Subject and description are required" });
        }

        let actualProviderId = provider_id || null;

        if (booking_id) {
            // Securely lookup the provider's user_id from the booking
            const bookingRes = await pool.query(`
                SELECT pp.user_id 
                FROM bookings b
                JOIN provider_profiles pp ON b.provider_id = pp.id
                WHERE b.id = $1
            `, [booking_id]);

            if (bookingRes.rows.length > 0) {
                actualProviderId = bookingRes.rows[0].user_id;
            }
        }

        const result = await pool.query(
            "INSERT INTO complaints (user_id, subject, description, priority, booking_id, provider_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [userId, subject, description, priority, booking_id || null, actualProviderId]
        );

        // Notify admins
        const { createNotification } = require('./notificationController');
        const adminRes = await pool.query("SELECT id FROM users WHERE role = 'admin'");
        const userName = req.user.name || "A user";

        for (const admin of adminRes.rows) {
            await createNotification(
                admin.id,
                "New Complaint Submitted",
                `${userName} submitted a new complaint: ${subject}`,
                "complaint",
                "/admin" // Could be a more specific URL later
            );
        }

        // Notify the provider if it's a specific complaint against them
        if (actualProviderId) {
            await createNotification(
                actualProviderId,
                "New Dispute Filed against You",
                `A customer has filed a dispute regarding a booking. Please check your disputes tab to respond.`,
                "dispute",
                "/provider/complaints"
            );
            
            // Also notify via email if the provider exists
            const providerRes = await pool.query("SELECT email FROM users WHERE id = $1", [actualProviderId]);
            if (providerRes.rows.length > 0 && providerRes.rows[0].email) {
                const { sendDisputeEmail } = require('../utils/emailService');
                try {
                    await sendDisputeEmail(
                        providerRes.rows[0].email,
                        "New Dispute Filed",
                        `A customer has filed a dispute regarding your booking. Please log in to your QuickServe provider dashboard and navigate to the Disputes tab to submit your response.`
                    );
                } catch (emailErr) {
                    console.error("Failed to send dispute email:", emailErr);
                    // Do not throw, allow the complaint to be created successfully
                }
            }
        }

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating complaint:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getAllComplaints = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*, 
                   u.name as user_name, u.email as user_email, u.role as user_role,
                   p.name as provider_name, p.email as provider_email
            FROM complaints c
            JOIN users u ON c.user_id = u.id
            LEFT JOIN users p ON c.provider_id = p.id
            ORDER BY c.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching complaints:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, priority } = req.body;

        const result = await pool.query(
            "UPDATE complaints SET status = COALESCE($1, status), priority = COALESCE($2, priority) WHERE id = $3 RETURNING *",
            [status, priority, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating complaint:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.replyToComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const { reply } = req.body;

        if (!reply) {
            return res.status(400).json({ message: "Reply content is required" });
        }

        const result = await pool.query(
            "UPDATE complaints SET admin_reply = $1, status = 'resolved', replied_at = NOW() WHERE id = $2 RETURNING *",
            [reply, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        const complaint = result.rows[0];

        // Fetch user role for correct notification routing
        const userRes = await pool.query("SELECT role FROM users WHERE id = $1", [complaint.user_id]);
        const userRole = userRes.rows[0]?.role || 'customer';
        const dashboardLink = userRole === 'provider' ? '/provider' : '/customer';

        // Notify the user who submitted the complaint
        const { createNotification } = require('./notificationController');
        await createNotification(
            complaint.user_id,
            "Admin Replied to Your Complaint",
            `Subject: ${complaint.subject}. Check your dashboard for the response.`,
            "complaint_reply",
            dashboardLink
        );

        res.json(complaint);
    } catch (error) {
        console.error("Error replying to complaint:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getMyComplaints = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            `SELECT c.*, p.name as provider_name
             FROM complaints c 
             LEFT JOIN users p ON c.provider_id = p.id
             WHERE c.user_id = $1 ORDER BY c.created_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching user complaints:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getProviderComplaints = async (req, res) => {
    try {
        const providerId = req.user.id;
        const result = await pool.query(
            `SELECT c.*, u.name as customer_name 
             FROM complaints c
             JOIN users u ON c.user_id = u.id
             WHERE c.provider_id = $1 
             ORDER BY c.created_at DESC`,
            [providerId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching provider complaints:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.respondToComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const { response } = req.body;
        const providerId = req.user.id;

        if (!response) {
            return res.status(400).json({ message: "Response content is required" });
        }

        const result = await pool.query(
            "UPDATE complaints SET provider_response = $1, provider_responded_at = NOW() WHERE id = $2 AND provider_id = $3 RETURNING *",
            [response, id, providerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Complaint not found or you don't have permission to respond" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error responding to complaint:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
