const pool = require('../db');
const fs = require('fs');
const path = require('path');

const logError = (error, context) => {
    try {
        const logPath = path.join(process.cwd(), 'critical_error.log');
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${context}\nError: ${error.message}\nStack: ${error.stack}\n\n`;
        fs.appendFileSync(logPath, logEntry);
    } catch (e) {
        console.error("Failed to write to log file:", e);
    }
};

exports.getMyNotifications = async (req, res) => {
    try {
        const userId = parseInt(req.user.id);
        const result = await pool.query(
            "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        logError(error, "getMyNotifications");
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const userId = parseInt(req.user.id);
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
        logError(error, "markAsRead");
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const userId = parseInt(req.user.id);
        await pool.query(
            "UPDATE notifications SET is_read = true WHERE user_id = $1",
            [userId]
        );
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        logError(error, "markAllAsRead");
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.markByType = async (req, res) => {
    try {
        const userId = parseInt(req.user.id);
        const { type } = req.body;
        if (!type) return res.status(400).json({ message: "type is required" });

        await pool.query(
            "UPDATE notifications SET is_read = true WHERE user_id = $1 AND type = $2",
            [userId, type]
        );
        res.json({ message: `Notifications of type ${type} marked as read` });
    } catch (error) {
        logError(error, "markByType");
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getBadgeStats = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            throw new Error("Authentication failed: User ID missing in request");
        }

        const userId = parseInt(req.user.id);
        const role = req.user.role;
        const stats = {
            bookings: 0,
            messages: 0,
            reviews: 0,
            verification: 0
        };

        // 1. Unread Messages for everyone
        const msgRes = await pool.query(
            "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false AND type = 'message'",
            [userId]
        );
        stats.messages = parseInt(msgRes.rows[0].count || 0);

        // 2. Unread Bookings for everyone
        const bookNotifRes = await pool.query(
            "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false AND type = 'booking'",
            [userId]
        );
        stats.bookings = parseInt(bookNotifRes.rows[0].count || 0);

        if (role === 'provider') {
            const revRes = await pool.query(
                "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false AND type = 'review'",
                [userId]
            );
            stats.reviews = parseInt(revRes.rows[0].count || 0);
        }

        if (role === 'admin') {
            const verNotifRes = await pool.query(
                "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false AND type = 'verification'",
                [userId]
            );
            stats.verification = parseInt(verNotifRes.rows[0].count || 0);
        }

        res.json(stats);
    } catch (error) {
        console.error("FATAL ERROR IN getBadgeStats:", error);
        res.status(500).json({
            message: "FATAL ERROR IN getBadgeStats",
            error: error.message,
            stack: error.stack,
            hint: "Check if pool is correctly initialized and table exists"
        });
    }
};

// Internal helper to create a notification
exports.createNotification = async (userId, title, message, type = 'system', link = null) => {
    try {
        const uId = parseInt(userId);
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, link, is_read)
             VALUES ($1, $2, $3, $4, $5, false)`,
            [uId, title, message, type, link]
        );
    } catch (error) {
        console.error("Failed to create notification:", error);
        logError(error, "createNotification Helper");
    }
};
