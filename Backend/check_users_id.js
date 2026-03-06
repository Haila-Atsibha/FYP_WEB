require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function checkSchema() {
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
        console.log("USERS COLUMNS:", res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

checkSchema();
