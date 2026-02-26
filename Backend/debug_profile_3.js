require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
    try {
        const userId = 3;
        const testQ = `
      SELECT p.*, u.name, u.email, u.phone, u.status AS user_status 
      FROM provider_profiles p
      JOIN users u ON p.user_id = u.id 
      WHERE p.user_id = $1
    `;
        const res = await pool.query(testQ, [userId]);
        console.log("QUERY SUCCESSFUL:", JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.log("ERROR_MESSAGE:", err.message);
    } finally {
        pool.end();
    }
}
run();
