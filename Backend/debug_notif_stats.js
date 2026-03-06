require('dotenv').config();
const pool = require('./src/db');

async function debugStats() {
    try {
        const users = await pool.query("SELECT id, name, role FROM users LIMIT 5");
        console.log("Found users:", users.rows);

        for (const user of users.rows) {
            console.log(`\n--- Testing for User: ${user.name} (ID: ${user.id}, Role: ${user.role}) ---`);
            const stats = {
                bookings: 0,
                messages: 0,
                reviews: 0,
                verification: 0
            };

            try {
                console.log("Querying messages...");
                const msgRes = await pool.query(
                    "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false AND type = 'message'",
                    [user.id]
                );
                stats.messages = parseInt(msgRes.rows[0].count);
                console.log("Messages:", stats.messages);

                console.log("Querying bookings...");
                const bookNotifRes = await pool.query(
                    "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false AND type = 'booking'",
                    [user.id]
                );
                stats.bookings = parseInt(bookNotifRes.rows[0].count);
                console.log("Bookings:", stats.bookings);

                if (user.role === 'provider') {
                    console.log("Querying reviews...");
                    const revRes = await pool.query(
                        "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false AND type = 'review'",
                        [user.id]
                    );
                    stats.reviews = parseInt(revRes.rows[0].count);
                    console.log("Reviews:", stats.reviews);
                }

                if (user.role === 'admin') {
                    console.log("Querying verification...");
                    const verNotifRes = await pool.query(
                        "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false AND type = 'verification'",
                        [user.id]
                    );
                    stats.verification = parseInt(verNotifRes.rows[0].count);
                    console.log("Verification:", stats.verification);
                }

                console.log("SUCCESS for user", user.id, ":", stats);
            } catch (err) {
                console.error("FAILED for user", user.id, "at query level:");
                console.error(err);
            }
        }
    } catch (globalErr) {
        console.error("GLOBAL ERROR:", globalErr);
    } finally {
        await pool.end();
    }
}

debugStats();
