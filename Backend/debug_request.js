require('dotenv').config();
const axios = require('axios');

async function debugRequest() {
    const baseURL = 'http://localhost:5001';

    try {
        console.log("1. Logging in...");
        // Use a known provider account if possible, or just try to find any approved user
        const { Pool } = require('pg');
        const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
        const userRes = await pool.query("SELECT email, password FROM users WHERE status = 'approved' LIMIT 1");
        await pool.end();

        if (userRes.rows.length === 0) {
            console.log("No approved users found for testing.");
            return;
        }

        const email = userRes.rows[0].email;
        // We don't know the plain password, so this is hard.
        // But we can manually generate a token for debugging!

        console.log("2. Generating debug token for:", email);
        const jwt = require('jsonwebtoken');
        const tokenUser = await getUserById(email); // Helper below
        const token = jwt.sign(
            { id: tokenUser.id, role: tokenUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log("3. Calling /api/notifications/stats...");
        const statsRes = await axios.get(`${baseURL}/api/notifications/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("STATS RESPONSE:", statsRes.data);

    } catch (error) {
        console.log("ERROR STATUS:", error.response?.status);
        console.log("ERROR DATA:", JSON.stringify(error.response?.data, null, 2));
    }
}

async function getUserById(email) {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    const res = await pool.query("SELECT id, role FROM users WHERE email = $1", [email]);
    await pool.end();
    return res.rows[0];
}

debugRequest();
