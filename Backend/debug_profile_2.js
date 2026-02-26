require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
    try {
        const userId = 3;
        const q1 = "SELECT * FROM information_schema.columns WHERE table_name = 'users'";
        const res1 = await pool.query(q1);
        console.log("USERS COLUMNS:", res1.rows.map(r => r.column_name).join(', '));

        const q2 = "SELECT * FROM information_schema.columns WHERE table_name = 'provider_profiles'";
        const res2 = await pool.query(q2);
        console.log("PROFILES COLUMNS:", res2.rows.map(r => r.column_name).join(', '));

        const testQ = `
      SELECT p.*, u.name, u.email, u.phone, u.status AS user_status 
      FROM provider_profiles p
      JOIN users u ON p.user_id = u.id 
      WHERE p.user_id = $1
    `;
        await pool.query(testQ, [userId]);
        console.log("QUERY SUCCESSFUL");
    } catch (err) {
        console.log("ERROR_MESSAGE:", err.message);
    } finally {
        pool.end();
    }
}
run();
