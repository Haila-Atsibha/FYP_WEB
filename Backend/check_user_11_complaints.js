require('dotenv').config();
const pool = require('./src/db');
async function check() {
    try {
        const res = await pool.query("SELECT id, subject, status, admin_reply FROM complaints WHERE user_id = 11 ORDER BY created_at DESC");
        console.log("Complaints for User 11:", JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
