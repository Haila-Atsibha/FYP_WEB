require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const fs = require('fs');

async function check() {
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
        const lines = res.rows.map(r => `${r.column_name}: ${r.data_type}`);
        fs.writeFileSync('users_schema_output.txt', lines.join('\n'));
        console.log("Schema written to users_schema_output.txt");
    } catch (err) {
        console.error("DB ERROR: " + err.message);
    } finally {
        pool.end();
    }
}
check();
