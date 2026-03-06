require('dotenv').config();
const pool = require('./src/db');

async function forceActivate() {
    try {
        const userId = 3; // The user 'provider'
        const profileId = 1; // From db_dump.json

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        console.log(`Activating user ${userId} (profile ${profileId})...`);

        // 1. Update Profile
        await pool.query(
            "UPDATE provider_profiles SET subscription_status = 'active', subscription_expiry = $1 WHERE user_id = $2",
            [expiryDate, userId]
        );

        // 2. Insert Manual Payment matching the dashboard query
        const txRef = 'manual-fix-' + Date.now();
        await pool.query(
            "INSERT INTO payments (provider_id, tx_ref, amount, status, payment_method) VALUES ($1, $2, $3, $4, $5)",
            [profileId, txRef, 200, 'success', 'manual']
        );

        console.log("SUCCESS: User activated and payment recorded.");
    } catch (err) {
        console.error("FORCE ACTIVATE ERROR:", err);
    } finally {
        await pool.end();
    }
}

forceActivate();
