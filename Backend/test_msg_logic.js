require('dotenv').config();
const pool = require('./src/db');

async function test() {
    try {
        // Try to get a valid booking ID first
        const booking = await pool.query("SELECT id FROM bookings LIMIT 1");
        if (booking.rows.length === 0) {
            console.log("No bookings found to test with.");
            return;
        }
        const bookingId = booking.rows[0].id;
        console.log(`Testing with booking ID: ${bookingId}`);

        // Simulate getMessagesByBooking logic
        const bookingRes = await pool.query(
            `SELECT b.*, pp.user_id AS provider_user_id 
             FROM bookings b 
             JOIN provider_profiles pp ON b.provider_id = pp.id 
             WHERE b.id = $1`,
            [bookingId]
        );
        console.log("Booking info fetched.");

        const messages = await pool.query(
            `SELECT m.id, m.booking_id, m.sender_id, m.message AS content, m.created_at, u.name AS sender_name
             FROM messages m
             LEFT JOIN users u ON m.sender_id = u.id
             WHERE m.booking_id = $1
             ORDER BY m.created_at ASC`,
            [bookingId]
        );
        console.log(`Messages fetched: ${messages.rows.length}`);
        console.table(messages.rows);

    } catch (e) {
        console.error("TEST FAILED:", e);
    } finally {
        pool.end();
    }
}

test();
