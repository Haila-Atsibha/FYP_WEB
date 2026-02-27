require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function migrate() {
    try {
        console.log("Checking for 'description' column in 'bookings' table...");
        const res = await pool.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'description'"
        );

        if (res.rows.length === 0) {
            console.log("Adding 'description' column to 'bookings' table...");
            await pool.query("ALTER TABLE bookings ADD COLUMN description TEXT");
            console.log("'description' column added successfully.");
        } else {
            console.log("'description' column already exists.");
        }

        // Also check if status needs more values or if it's just a text field (usually matches what we need)
        // Ensure 'messages' has what it needs (booking_id, sender_id, message) -> It seems it does from previous partial reads.

    } catch (e) {
        console.error("Migration Error:", e.message);
    } finally {
        pool.end();
    }
}

migrate();
