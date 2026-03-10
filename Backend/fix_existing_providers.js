const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function fix() {
    try {
        console.log("Starting provider visibility fix...");

        // Update all approved providers to have an active subscription
        const result = await pool.query(`
            UPDATE provider_profiles 
            SET subscription_status = 'active', 
                subscription_expiry = NOW() + INTERVAL '1 month',
                is_verified = true
            WHERE user_id IN (SELECT id FROM users WHERE role = 'provider' AND status = 'approved')
            RETURNING user_id
        `);

        console.log(`Updated ${result.rows.length} providers.`);
        result.rows.forEach(row => console.log(`- Fixed User ID: ${row.user_id}`));

        console.log("Fix completed successfully.");

    } catch (e) {
        console.error("Error during fix:", e);
    } finally {
        await pool.end();
    }
}

fix();
