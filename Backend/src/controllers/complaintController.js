const pool = require('../db');

exports.createComplaint = async (req, res) => {
    try {
        const userId = req.user.id;
        const { subject, description, priority = 'medium' } = req.body;

        if (!subject || !description) {
            return res.status(400).json({ message: "Subject and description are required" });
        }

        const result = await pool.query(
            "INSERT INTO complaints (user_id, subject, description, priority) VALUES ($1, $2, $3, $4) RETURNING *",
            [userId, subject, description, priority]
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

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating complaint:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getAllComplaints = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*, u.name as user_name, u.email as user_email, u.role as user_role
            FROM complaints c
            JOIN users u ON c.user_id = u.id
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
            "SELECT id, subject, description, status, priority, admin_reply, replied_at, created_at FROM complaints WHERE user_id = $1 ORDER BY created_at DESC",
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching user complaints:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
