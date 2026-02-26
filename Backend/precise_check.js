require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
    try {
        const resU = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id'");
        console.log("USERS table:");
        resU.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));

        const resB = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bookings' AND column_name IN ('id', 'customer_id')");
        console.log("BOOKINGS table:");
        resB.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));
    } catch (err) {
        console.error("DB ERROR: " + err.message);
    } finally {
        pool.end();
    }
}
check();
