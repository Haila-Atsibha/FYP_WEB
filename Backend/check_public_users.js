require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND table_schema = 'public'");
        console.log("public.users columns:");
        res.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));
    } catch (err) {
        console.error("DEBUG ERROR:", err.message);
    } finally {
        pool.end();
    }
}
run();
