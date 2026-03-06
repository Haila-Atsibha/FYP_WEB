require('dotenv').config();
const pool = require('./src/db');
async function check() {
    try {
        const res = await pool.query("SELECT * FROM complaints LIMIT 1");
        if (res.rows.length > 0) {
            console.log("All Columns in complaints table:");
            console.log(Object.keys(res.rows[0]));
        } else {
            console.log("No complaints found.");
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
