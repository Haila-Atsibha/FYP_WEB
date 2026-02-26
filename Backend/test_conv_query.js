require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function testQuery() {
    const userId = 1; // Assuming a user id exists, we just want to see if the query fails due to schema
    try {
        const query = `
            SELECT DISTINCT ON (b.id)
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
             ORDER BY b.id, m.created_at DESC
        `;
        const res = await pool.query(query, [userId]);
        console.log("Query successful:", res.rows.length, "rows");
    } catch (err) {
        console.error("QUERY ERROR:", err.message);
        console.error(err);
    } finally {
        pool.end();
    }
}

testQuery();
