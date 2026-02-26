require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
    try {
        const email = 'provider@test.com';
        const res = await pool.query("SELECT p.* FROM provider_profiles p JOIN users u ON p.user_id = u.id WHERE u.email = $1", [email]);
        console.log("Profile for", email, ":", JSON.stringify(res.rows, null, 2));

        if (res.rows.length === 0) {
            const userRes = await pool.query("SELECT id, role FROM users WHERE email = $1", [email]);
            console.log("User record:", JSON.stringify(userRes.rows, null, 2));
        }
    } catch (err) {
        console.error("DB ERROR: " + err.message);
    } finally {
        pool.end();
    }
}
check();
