require('dotenv').config();
const pool = require('./src/db');

async function test() {
    try {
        const userId = 1; // Assuming there is a user with ID 1
        console.log(`Testing getCustomerConversations for userId: ${userId}`);

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

        console.log(`Query succeeded. Found ${conversations.rows.length} conversations.`);
        console.table(conversations.rows);

    } catch (e) {
        console.error("QUERY FAILED:", e);
    } finally {
        pool.end();
    }
}

test();
