require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function verify() {
    try {
        const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'notifications' 
      ORDER BY ordinal_position
    `);
        console.log("COLUMNS FOR 'notifications':");
        console.log(JSON.stringify(res.rows, null, 2));

        const sample = await pool.query("SELECT * FROM notifications LIMIT 1");
        console.log("\nSAMPLE ROW:");
        console.log(JSON.stringify(sample.rows[0], null, 2));
    } catch (err) {
        console.error("VERIFY ERROR:", err);
    } finally {
        await pool.end();
    }
}

verify();
