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
             (booking_id, sender_id, message)
             VALUES ($1,$2,$3) RETURNING id, booking_id, sender_id, message AS content, created_at`,
            [booking_id, userId, content]
        );

        res.status(201).json({ message: "Message sent", messageObj: insert.rows[0] });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.getCustomerConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch unique "conversations" based on bookings
        // This query gets the most recent message for each booking the user is involved in
        const conversations = await pool.query(
            `SELECT DISTINCT ON (b.id)
                b.id AS booking_id,
                b.status AS booking_status,
                s.title AS service_title,
                u.name AS partner_name,
                u.id AS partner_id,
                m.message AS last_message,
                m.created_at AS last_message_time
             FROM bookings b
             JOIN services s ON b.service_id = s.id
             JOIN provider_profiles pp ON b.provider_id = pp.id
             JOIN users u ON pp.user_id = u.id
             LEFT JOIN messages m ON b.id = m.booking_id
             WHERE b.customer_id = $1
             ORDER BY b.id, m.created_at DESC`,
            [userId]
        );

        // Sort by last message time (descending)
        const sortedConversations = conversations.rows.sort((a, b) => {
            const timeA = a.last_message_time ? new Date(a.last_message_time) : new Date(0);
            const timeB = b.last_message_time ? new Date(b.last_message_time) : new Date(0);
            return timeB - timeA;
        });

        res.json(sortedConversations);
    } catch (error) {
        console.error("Error in getCustomerConversations:", error);
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
            `SELECT m.id, m.booking_id, m.sender_id, m.message AS content, m.created_at, u.name AS sender_name
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