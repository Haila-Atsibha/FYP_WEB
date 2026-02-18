const pool = require('../db');

// customers write reviews once a booking is completed
exports.createReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { booking_id, rating, comment } = req.body;

        if (!booking_id || rating == null) {
            return res.status(400).json({ message: "booking_id and rating are required" });
        }

        // fetch booking and validate ownership / status
        const bookRes = await pool.query(
            "SELECT * FROM bookings WHERE id = $1",
            [booking_id]
        );
        if (bookRes.rows.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }
        const booking = bookRes.rows[0];
        if (booking.customer_id !== userId) {
            return res.status(403).json({ message: "Forbidden" });
        }
        if (booking.status !== 'completed') {
            return res.status(400).json({ message: "Can only review completed bookings" });
        }

        // ensure not already reviewed
        const existing = await pool.query(
            "SELECT * FROM reviews WHERE booking_id = $1",
            [booking_id]
        );
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: "Booking already reviewed" });
        }

        // insert review; provider/service ids from booking
        const providerId = booking.provider_id;
        const serviceId = booking.service_id;

        const ins = await pool.query(
            `INSERT INTO reviews
             (booking_id, provider_id, service_id, customer_id, rating, comment)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [booking_id, providerId, serviceId, userId, rating, comment]
        );
        const review = ins.rows[0];

        // recalc average rating for provider
        const avgRes = await pool.query(
            `SELECT AVG(rating)::numeric(10,2) AS avg_rating
             FROM reviews
             WHERE provider_id = $1`,
            [providerId]
        );
        const avg = avgRes.rows[0].avg_rating || 0;

        await pool.query(
            "UPDATE provider_profiles SET average_rating = $1 WHERE id = $2",
            [avg, providerId]
        );

        res.status(201).json({ message: "Review created", review });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// fetch reviews for a given service
exports.getServiceReviews = async (req, res) => {
    try {
        const { service_id } = req.params;
        if (!service_id) {
            return res.status(400).json({ message: "service_id is required" });
        }

        const reviews = await pool.query(
            `SELECT r.*, u.name AS customer_name
             FROM reviews r
             LEFT JOIN users u ON r.customer_id = u.id
             WHERE r.service_id = $1
             ORDER BY r.created_at DESC`,
            [service_id]
        );

        res.json(reviews.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};