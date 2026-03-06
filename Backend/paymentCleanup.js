require('dotenv').config();
const pool = require('./src/db');
const { createNotification } = require('./src/controllers/notificationController');

async function cleanupSubscriptions() {
    console.log(`[${new Date().toISOString()}] Starting subscription cleanup...`);

    try {
        // 1. Mark expired providers
        const expiredResult = await pool.query(`
            UPDATE provider_profiles 
            SET subscription_status = 'expired' 
            WHERE subscription_status = 'active' 
            AND subscription_expiry < CURRENT_DATE
            RETURNING user_id
        `);

        if (expiredResult.rows.length > 0) {
            console.log(`Marked ${expiredResult.rows.length} providers as expired.`);
            for (const row of expiredResult.rows) {
                await createNotification(
                    row.user_id,
                    "Subscription Expired",
                    "Your monthly subscription has expired. Your profile is no longer visible to customers. Please renew to continue receiving bookings.",
                    "subscription",
                    "/provider"
                );
            }
        }

        // 2. Send reminders for subscriptions expiring in 3 days
        const expiringSoon = await pool.query(`
            SELECT user_id, subscription_expiry 
            FROM provider_profiles 
            WHERE subscription_status = 'active' 
            AND subscription_expiry BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '3 days')
        `);

        if (expiringSoon.rows.length > 0) {
            console.log(`Found ${expiringSoon.rows.length} providers expiring soon.`);
            for (const row of expiringSoon.rows) {
                // Check if we already sent a reminder today to avoid spam
                // (Very simple check: see if a notification exists from today)
                const alreadyNotified = await pool.query(`
                    SELECT id FROM notifications 
                    WHERE user_id = $1 
                    AND type = 'subscription' 
                    AND title = 'Subscription Expiring Soon'
                    AND created_at >= CURRENT_DATE
                `, [row.user_id]);

                if (alreadyNotified.rows.length === 0) {
                    await createNotification(
                        row.user_id,
                        "Subscription Expiring Soon",
                        `Your subscription will expire on ${new Date(row.subscription_expiry).toLocaleDateString()}. Renew early to keep your profile visible.`,
                        "subscription",
                        "/provider"
                    );
                }
            }
        }

        console.log("Subscription cleanup finished.");
    } catch (error) {
        console.error("Cleanup Error:", error);
    } finally {
        // If running as a standalone script, we should close the pool
        // but if imported elsewhere, maybe not. 
        // For cron use, we'll close it.
        await pool.end();
    }
}

if (require.main === module) {
    cleanupSubscriptions();
}

module.exports = cleanupSubscriptions;
