require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
    try {
        const u = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id'");
        const n = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_id'");
        const sample = await pool.query("SELECT id FROM users LIMIT 1");

        console.log("users.id type:", u.rows[0]?.data_type);
        console.log("notifications.user_id type:", n.rows[0]?.data_type);
        console.log("Sample users.id:", sample.rows[0]?.id);
        console.log("Type of sample id in JS:", typeof sample.rows[0]?.id);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
check();
