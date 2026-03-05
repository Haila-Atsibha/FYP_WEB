const pool = require('../db');

exports.getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Notification not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await pool.query(
            "UPDATE notifications SET is_read = true WHERE user_id = $1",
            [userId]
        );
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.markByType = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type } = req.body;
        if (!type) return res.status(400).json({ message: "type is required" });

        await pool.query(
            "UPDATE notifications SET is_read = true WHERE user_id = $1 AND type = $2",
            [userId, type]
        );
        res.json({ message: `Notifications of type ${type} marked as read` });
    } catch (error) {
        console.error("Error in markByType:", error);
        res.status(500).json({ message: "Server error", error: error.message, stack: error.stack });
    }
};

exports.getBadgeStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const stats = {
            bookings: 0,
            messages: 0,
            reviews: 0,
            verification: 0
        };

        // 1. Unread Messages for everyone (based on notifications of type 'message')
        const msgRes = await pool.query(
            "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false AND type = 'message'",
            [userId]
        );
        stats.messages = parseInt(msgRes.rows[0].count);

        // 2. Unread Bookings for everyone (based on notifications of type 'booking')
        const bookNotifRes = await pool.query(
            "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false AND type = 'booking'",
            [userId]
        );
        stats.bookings = parseInt(bookNotifRes.rows[0].count);

        if (role === 'provider') {
            // 3. New Reviews for provider (unread notifications of type 'review')
            const revRes = await pool.query(
                "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false AND type = 'review'",
                [userId]
            );
            stats.reviews = parseInt(revRes.rows[0].count);
        }

        if (role === 'admin') {
            // 4. Pending verifications for admin (unread notifications of type 'verification')
            const verNotifRes = await pool.query(
                "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false AND type = 'verification'",
                [userId]
            );
            stats.verification = parseInt(verNotifRes.rows[0].count);
        }

        res.json(stats);
    } catch (error) {
        console.error("Error in getBadgeStats:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Internal helper to create a notification
exports.createNotification = async (userId, title, message, type = 'system', link = null) => {
    try {
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, link, is_read)
             VALUES ($1, $2, $3, $4, $5, false)`,
            [userId, title, message, type, link]
        );
    } catch (error) {
        console.error("Failed to create notification:", error);
    }
};
