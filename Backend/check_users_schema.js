require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
    try {
        const res = await pool.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'users'");
        console.log("USERS TABLES FOUND:", JSON.stringify(res.rows, null, 2));

        const res2 = await pool.query("SELECT table_schema, table_name, column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone'");
        console.log("PHONE COLUMN FOUND IN:", JSON.stringify(res2.rows, null, 2));
    } catch (err) {
        console.error("DEBUG ERROR:", err.message);
    } finally {
        pool.end();
    }
}
run();
