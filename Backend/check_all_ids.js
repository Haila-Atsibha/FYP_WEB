require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
    try {
        const tables = ['users', 'bookings', 'provider_profiles', 'services', 'messages'];
        for (const table of tables) {
            const res = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}' AND column_name IN ('id', 'user_id', 'customer_id', 'provider_id', 'booking_id', 'service_id')`);
            console.log(`--- ${table} ---`);
            res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
        }
    } catch (err) {
        console.error("DB ERROR: " + err.message);
    } finally {
        pool.end();
    }
}

check();
Simon
