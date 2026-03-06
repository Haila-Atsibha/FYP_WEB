require('dotenv').config();
const pool = require('./src/db');
async function check() {
    try {
        const res = await pool.query("SELECT id, subject, status, admin_reply FROM complaints ORDER BY created_at DESC LIMIT 5");
        console.log("Recent Complaints:", JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
