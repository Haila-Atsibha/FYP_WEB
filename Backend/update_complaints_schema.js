require('dotenv').config();
const pool = require('./src/db');

async function migrate() {
    try {
        console.log("Migrating complaints table...");
        await pool.query("ALTER TABLE complaints ADD COLUMN IF NOT EXISTS admin_reply TEXT;");
        await pool.query("ALTER TABLE complaints ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP;");
        console.log("Migration successful!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err.message);
        process.exit(1);
    }
}

migrate();
