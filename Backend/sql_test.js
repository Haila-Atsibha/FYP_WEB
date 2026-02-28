require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function test() {
    const providerId = 1; // dummy id for test
    try {
        console.log("Checking categories query...");
        await pool.query('SELECT c.*, COUNT(DISTINCT s.provider_id)::int as "providerCount" FROM service_categories c LEFT JOIN services s ON c.id = s.category_id GROUP BY c.id ORDER BY c.created_at DESC');
        console.log("Categories query OK");

        console.log("Checking stats query (Pending)...");
        await pool.query("SELECT COUNT(*) FROM bookings WHERE provider_id = $1 AND status = 'pending'", [providerId]);
        console.log("Stats query (Pending) OK");

        console.log("Checking stats query (Active)...");
        await pool.query("SELECT COUNT(*) FROM bookings WHERE provider_id = $1 AND status = 'accepted'", [providerId]);
        console.log("Stats query (Active) OK");

        console.log("Checking stats query (Completed)...");
        await pool.query("SELECT COUNT(*) FROM bookings WHERE provider_id = $1 AND status = 'completed'", [providerId]);
        console.log("Stats query (Completed) OK");

        console.log("Checking stats query (Earnings)...");
        await pool.query("SELECT SUM(total_price) as total FROM bookings WHERE provider_id = $1 AND status = 'completed'", [providerId]);
        console.log("Stats query (Earnings) OK");

        console.log("Checking bookings query...");
        await pool.query(`SELECT b.*, s.title, s.price, u.name AS customer_name, u.email AS customer_email
              FROM bookings b
              JOIN services s ON b.service_id = s.id
              JOIN users u ON b.customer_id = u.id
              WHERE b.provider_id = $1
              ORDER BY b.created_at DESC`, [providerId]);
        console.log("Bookings query OK");

        console.log("Checking services query...");
        await pool.query(`SELECT s.*, c.name AS category_name 
              FROM services s 
              LEFT JOIN service_categories c ON s.category_id = c.id 
              WHERE s.provider_id = $1 
              ORDER BY s.created_at DESC`, [providerId]);
        console.log("Services query OK");

        console.log("ALL QUERIES OK");
    } catch (e) {
        console.error("QUERY ERROR:", e);
    } finally {
        pool.end();
    }
}
test();
