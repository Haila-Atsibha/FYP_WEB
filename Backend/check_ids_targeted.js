require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
    try {
        const tables = ['bookings', 'services', 'provider_profiles', 'users'];
        for (const table of tables) {
            const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 AND column_name = 'id'", [table]);
            if (res.rows.length > 0) {
                console.log(`${table}.id: ${res.rows[0].data_type}`);
            } else {
                console.log(`${table}.id: NOT FOUND`);
            }
        }
    } catch (err) {
        console.error("DB ERROR: " + err.message);
    } finally {
        pool.end();
    }
}

check();
