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
