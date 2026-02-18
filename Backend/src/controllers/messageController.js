const pool = require('../db');

// messaging between customer and provider tied to a booking

exports.sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { booking_id, content } = req.body;

        if (!booking_id || !content) {
            return res.status(400).json({ message: "booking_id and content are required" });
        }

        const bookingRes = await pool.query(
            "SELECT * FROM bookings WHERE id = $1",
            [booking_id]
        );
        if (bookingRes.rows.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }
        const booking = bookingRes.rows[0];

        // ensure sender is either customer or provider tied to booking
        const isCustomer = booking.customer_id === userId;
        const isProvider = booking.provider_id === userId;
        if (!isCustomer && !isProvider) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const insert = await pool.query(
            `INSERT INTO messages
             (booking_id, sender_id, content)
             VALUES ($1,$2,$3) RETURNING *`,
            [booking_id, userId, content]
        );

        res.status(201).json({ message: "Message sent", messageObj: insert.rows[0] });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.getMessagesByBooking = async (req, res) => {
    try {
        const userId = req.user.id;
        const { booking_id } = req.params;

        if (!booking_id) {
            return res.status(400).json({ message: "booking_id is required" });
        }

        const bookingRes = await pool.query(
            "SELECT * FROM bookings WHERE id = $1",
            [booking_id]
        );
        if (bookingRes.rows.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }
        const booking = bookingRes.rows[0];

        if (booking.customer_id !== userId && booking.provider_id !== userId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const messages = await pool.query(
            `SELECT m.*, u.name AS sender_name
             FROM messages m
             LEFT JOIN users u ON m.sender_id = u.id
             WHERE m.booking_id = $1
             ORDER BY m.created_at ASC`,
            [booking_id]
        );

        res.json(messages.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};