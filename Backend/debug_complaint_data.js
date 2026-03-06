require('dotenv').config();
const pool = require('./src/db');
async function check() {
    try {
        const res = await pool.query("SELECT * FROM complaints WHERE admin_reply IS NOT NULL LIMIT 1");
        if (res.rows.length > 0) {
            console.log("Sample Row Keys and Values:");
            for (let key in res.rows[0]) {
                console.log(`${key}: (${typeof res.rows[0][key]}) ${res.rows[0][key]}`);
            }
        } else {
            console.log("No complaints with replies found.");
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
