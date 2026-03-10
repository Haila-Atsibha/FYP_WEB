const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check() {
    try {
        const users = await pool.query("SELECT id, name, role, status FROM users WHERE role = 'provider'");
        console.log("USERS:", JSON.stringify(users.rows, null, 2));

        const profiles = await pool.query("SELECT user_id, subscription_status, subscription_expiry, is_verified FROM provider_profiles");
        console.log("PROFILES:", JSON.stringify(profiles.rows, null, 2));

        const visible = await pool.query(`
            SELECT u.id, u.name, u.status, p.subscription_status, p.subscription_expiry
            FROM users u
            JOIN provider_profiles p ON u.id = p.user_id
            WHERE u.role = 'provider'
        `);
        console.log("VISIBLE JOIN:", JSON.stringify(visible.rows, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

check();
