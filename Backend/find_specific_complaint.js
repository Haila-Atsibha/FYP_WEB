require('dotenv').config();
const pool = require('./src/db');
async function check() {
    try {
        const res = await pool.query("SELECT * FROM complaints WHERE description ILIKE '%subscription payment%' LIMIT 5");
        console.log("Found Complaints:", JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
