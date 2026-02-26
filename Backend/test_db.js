require('dotenv').config();
const pool = require('./src/db');

async function test() {
    try {
        console.log("Testing connection...");
        const res = await pool.query("SELECT NOW()");
        console.log("Connection successful:", res.rows[0]);

        console.log("Checking tables...");
        const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log("Tables found:", tables.rows.map(r => r.table_name));

        console.log("Checking users table...");
        const userIdCol = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id'");
        console.log("Users ID column:", userIdCol.rows[0]);

        if (tables.rows.some(r => r.table_name === 'notifications')) {
            console.log("Checking notifications table...");
            const columns = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'notifications'");
            console.log("Notifications columns:", columns.rows);
        } else {
            console.log("CRITICAL: notifications table NOT found!");
        }

    } catch (err) {
        console.error("DATABASE ERROR:", err);
    } finally {
        pool.end();
    }
}

test();
