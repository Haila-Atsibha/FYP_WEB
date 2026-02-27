require('dotenv').config();
const pool = require('./src/db');

async function run() {
    try {
        const res = await pool.query("SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'bookings'");
        console.table(res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
