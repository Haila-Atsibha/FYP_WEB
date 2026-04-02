const pool = require('../db');

exports.getCustomerStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Active bookings (pending, accepted)
        const activeRes = await pool.query(
            "SELECT COUNT(*) FROM bookings WHERE customer_id = $1 AND status IN ('pending', 'accepted')",
            [userId]
        );

        // Completed bookings
        const completedRes = await pool.query(
            "SELECT COUNT(*) FROM bookings WHERE customer_id = $1 AND status = 'completed'",
            [userId]
        );

        // Cancelled bookings
        const cancelledRes = await pool.query(
            "SELECT COUNT(*) FROM bookings WHERE customer_id = $1 AND status = 'cancelled'",
            [userId]
        );

        // Unread notifications
        const unreadNotificationsRes = await pool.query(
            "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false",
            [userId]
        );

        res.json({
            active: parseInt(activeRes.rows[0].count),
            completed: parseInt(completedRes.rows[0].count),
            cancelled: parseInt(cancelledRes.rows[0].count),
            unread: parseInt(unreadNotificationsRes.rows[0].count)
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.getCustomerProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            "SELECT id as user_id, name, email, phone, status as user_status, profile_image_url FROM users WHERE id = $1",
            [userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.updateCustomerProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone } = req.body;
        
        let profileImageUrl;
        if (req.file) {
            const { uploadFile } = require('../utils/supabaseHelper');
            profileImageUrl = await uploadFile(req.file.buffer, req.file.mimetype, 'profiles');
        }

        let query = "UPDATE users SET name = $1, phone = $2";
        const values = [name, phone];

        if (profileImageUrl) {
            query += ", profile_image_url = $3";
            values.push(profileImageUrl);
        }

        query += " WHERE id = $" + (values.length + 1) + " RETURNING id, name, email, phone, profile_image_url";
        values.push(userId);

        const result = await pool.query(query, values);

        res.json({
            message: "Profile updated successfully",
            profile: result.rows[0]
        });
    } catch (error) {
        console.error("Error in updateCustomerProfile:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
