require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
    try {
        const queries = {
            users: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id'",
            bookings: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'id'",
            provider_profiles: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'provider_profiles' AND column_name = 'id'",
            services: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'id'"
        };
        const results = {};
        for (const [table, q] of Object.entries(queries)) {
            const res = await pool.query(q);
            results[table] = res.rows[0];
        }
        console.log(JSON.stringify(results, null, 2));
    } catch (err) {
        console.error("DB ERROR: " + err.message);
    } finally {
        pool.end();
    }
}

check();
