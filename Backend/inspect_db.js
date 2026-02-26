require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
    try {
        const resTables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        const tables = resTables.rows.map(r => r.table_name);
        console.log('Tables:', tables.join(', '));

        for (const table of tables) {
            const resCols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1", [table]);
            console.log(`--- ${table} ---`);
            console.log(resCols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));
        }
    } catch (err) {
        console.error("DB ERROR:", err);
    } finally {
        pool.end();
    }
}

check();
