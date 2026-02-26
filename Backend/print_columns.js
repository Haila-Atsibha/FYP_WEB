require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
    try {
        const tables = ['bookings', 'provider_profiles', 'messages', 'services', 'users'];
        for (const table of tables) {
            const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = $1", [table]);
            console.log(`--- ${table} ---`);
            console.log(res.rows.map(r => r.column_name).join(', '));
        }
    } catch (err) {
        console.error("DB ERROR: " + err.message);
    } finally {
        pool.end();
    }
}

check();
