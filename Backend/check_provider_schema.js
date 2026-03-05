require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
async function run() {
    try {
        const res = await pool.query("SELECT * FROM provider_profiles LIMIT 1");
        console.log("COLUMNS:", Object.keys(res.rows[0] || {}));
    } catch (e) {
        console.error("ERROR:", e.message);
    } finally {
        await pool.end();
    }
}
run();
