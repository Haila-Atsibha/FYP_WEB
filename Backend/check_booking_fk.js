require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
    try {
        const resB = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bookings' AND column_name IN ('customer_id', 'provider_id')");
        resB.rows.forEach(r => console.log(`Bookings.${r.column_name}: ${r.data_type}`));
    } catch (err) {
        console.error("DB ERROR: " + err.message);
    } finally {
        pool.end();
    }
}
check();
Simon
