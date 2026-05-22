require('dotenv').config();
const pool = require('./src/db');

async function migrate() {
    try {
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS otp VARCHAR(10),
            ADD COLUMN IF NOT EXISTS otp_expires TIMESTAMP
        `);
        console.log("Migration successful");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        process.exit();
    }
}

migrate();
