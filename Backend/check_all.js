require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
    try {
        console.log("--- ALL CATEGORIES ---");
        const cat = await pool.query("SELECT id, name FROM service_categories");
        console.log(cat.rows);

        console.log("\n--- ALL PENDING PROVIDERS ---");
        const users = await pool.query("SELECT id, name, email FROM users WHERE role = 'provider' AND status = 'pending'");
        console.log(users.rows);

    } catch (err) {
        console.error(err.message);
    } finally {
        pool.end();
    }
}
check();
