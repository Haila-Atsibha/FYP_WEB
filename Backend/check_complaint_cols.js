require('dotenv').config();
const pool = require('./src/db');
async function check() {
    try {
        const res = await pool.query("SELECT * FROM complaints LIMIT 1");
        console.log("Columns:", Object.keys(res.rows[0] || {}));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
