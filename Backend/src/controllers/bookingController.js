const pool = require('../db');
const { createNotification } = require('./notificationController');

// customers place bookings, providers manage them

// create a booking (customer only)
exports.createBooking = async (req, res) => {
    try {
        const userId = req.user.id; // customer id
        const { service_id } = req.body;

        if (!service_id) {
            return res.status(400).json({ message: "service_id is required" });
        }

        // fetch service
        const svcRes = await pool.query(
            "SELECT * FROM services WHERE id = $1",
            [service_id]
        );
        if (svcRes.rows.length === 0) {
            return res.status(404).json({ message: "Service not found" });
        }

        const service = svcRes.rows[0];
        const providerId = service.provider_id;
        const totalPrice = service.price;

        const ins = await pool.query(
            `INSERT INTO bookings
             (service_id, provider_id, customer_id, total_price, status)
             VALUES ($1,$2,$3,$4,'pending') RETURNING *`,
            [service_id, providerId, userId, totalPrice]
        );

        await createNotification(
            providerId,
            "New Booking Request",
            `You have a new booking request for "${service.title}"`,
            'booking',
            '/provider/bookings'
        );

        res.status(201).json({
            message: "Booking created",
            booking: ins.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// get bookings for customer
exports.getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;

        const bookings = await pool.query(
            `SELECT b.*, s.title, s.price, u.name as provider_name
             FROM bookings b
             JOIN services s ON b.service_id = s.id
             JOIN provider_profiles pp ON b.provider_id = pp.id
             JOIN users u ON pp.user_id = u.id
             WHERE b.customer_id = $1
             ORDER BY b.created_at DESC`,
            [userId]
        );

        res.json(bookings.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// get bookings for provider (uses provider profile id)
exports.getProviderBookings = async (req, res) => {
    try {
        const userId = req.user.id;

        const profileRes = await pool.query(
            "SELECT id FROM provider_profiles WHERE user_id = $1",
            [userId]
        );
        if (profileRes.rows.length === 0) {
            return res.status(404).json({ message: "Provider profile not found" });
        }
        const providerId = profileRes.rows[0].id;

        const bookings = await pool.query(
            `SELECT b.*, s.title, s.price, u.name AS customer_name, u.email AS customer_email
             FROM bookings b
             JOIN services s ON b.service_id = s.id
             JOIN users u ON b.customer_id = u.id
             WHERE b.provider_id = $1
             ORDER BY b.created_at DESC`,
            [providerId]
        );

        res.json(bookings.rows);
    } catch (error) {
        console.error("Error in getProviderBookings:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// update booking status with transition rules
exports.updateBookingStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "status is required" });
        }

        const bookingRes = await pool.query(
            "SELECT b.*, s.title FROM bookings b JOIN services s ON b.service_id = s.id WHERE b.id = $1",
            [id]
        );
        if (bookingRes.rows.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }
        const booking = bookingRes.rows[0];
        const current = booking.status;

        // helper to persist change
        const persist = async newStatus => {
            const upd = await pool.query(
                "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
                [newStatus, id]
            );
            res.json({ message: "Status updated", booking: upd.rows[0] });
        };

        if (req.user.role === 'provider') {
            // provider ownership
            const profileRes = await pool.query(
                "SELECT id FROM provider_profiles WHERE user_id = $1",
                [userId]
            );
            if (profileRes.rows.length === 0) {
                return res.status(404).json({ message: "Provider profile not found" });
            }
            const providerId = profileRes.rows[0].id;
            if (booking.provider_id !== providerId) {
                return res.status(403).json({ message: "Forbidden" });
            }

            // allowable transitions for provider
            if (status === 'accepted') {
                if (current !== 'pending') {
                    return res.status(400).json({ message: "Can only accept pending bookings" });
                }
                await createNotification(
                    booking.customer_id,
                    "Booking Accepted",
                    `Your booking for "${booking.title}" has been accepted.`,
                    'booking',
                    '/customer/bookings'
                );
                return persist('accepted');
            }
            if (status === 'rejected') {
                if (current !== 'pending') {
                    return res.status(400).json({ message: "Can only reject pending bookings" });
                }
                await createNotification(
                    booking.customer_id,
                    "Booking Rejected",
                    `Your booking for "${booking.title}" has been rejected.`,
                    'booking',
                    '/customer/bookings'
                );
                return persist('rejected');
            }
            if (status === 'completed') {
                if (current !== 'accepted') {
                    return res.status(400).json({ message: "Can only complete accepted bookings" });
                }
                await createNotification(
                    booking.customer_id,
                    "Booking Completed",
                    `Your service for "${booking.title}" has been marked as completed.`,
                    'booking',
                    '/customer/bookings'
                );
                return persist('completed');
            }

            return res.status(400).json({ message: "Invalid status transition for provider" });
        }

        if (req.user.role === 'customer') {
            if (booking.customer_id !== userId) {
                return res.status(403).json({ message: "Forbidden" });
            }
            if (status === 'cancelled') {
                if (current !== 'pending') {
                    return res.status(400).json({ message: "Can only cancel pending bookings" });
                }
                await createNotification(
                    booking.provider_id,
                    "Booking Cancelled",
                    `The customer has cancelled the booking for "${booking.title}"`,
                    'booking',
                    '/provider/bookings'
                );
                return persist('cancelled');
            }
            return res.status(400).json({ message: "Invalid status transition for customer" });
        }

        res.status(403).json({ message: "Unauthorized role" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};