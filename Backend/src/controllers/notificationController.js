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

// Internal helper to create a notification
exports.createNotification = async (userId, title, message, type = 'system', link = null) => {
    try {
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, link)
             VALUES ($1, $2, $3, $4, $5)`,
            [userId, title, message, type, link]
        );
    } catch (error) {
        console.error("Failed to create notification:", error);
    }
};
