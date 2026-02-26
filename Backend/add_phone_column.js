require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function migrate() {
    try {
        console.log("Adding phone column to users table...");
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT");
        console.log("Column added successfully.");
    } catch (err) {
        console.error("MIGRATION ERROR:", err.message);
    } finally {
        pool.end();
    }
}

migrate();
