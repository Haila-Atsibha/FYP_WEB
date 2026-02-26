require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function testQuery() {
    try {
        const userId = 3; // From previous check_exists.js output for provider@test.com
        console.log("Testing query for userId:", userId);

        // The query used in providerController.getMyProfile
        const query = `
      SELECT p.*, u.name, u.email, u.phone, u.status AS user_status 
      FROM provider_profiles p
      JOIN users u ON p.user_id = u.id 
      WHERE p.user_id = $1
    `;

        const res = await pool.query(query, [userId]);
        console.log("Query Results:", JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error("QUERY ERROR:", err.message);
        console.error("Stack:", err.stack);
    } finally {
        pool.end();
    }
}

testQuery();
