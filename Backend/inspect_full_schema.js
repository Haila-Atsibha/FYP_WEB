require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function checkSchema() {
    try {
        console.log("--- USERS SCHEMA ---");
        const users = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
        users.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

        console.log("\n--- NOTIFICATIONS SCHEMA ---");
        const notifications = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'notifications'");
        notifications.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

        console.log("\n--- SAMPLE USER ---");
        const sample = await pool.query("SELECT id, name FROM users LIMIT 1");
        console.log(JSON.stringify(sample.rows[0]));

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

checkSchema();
