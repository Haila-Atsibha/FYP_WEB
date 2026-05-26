require('dotenv').config();
const pool = require('./src/db');

async function alterComplaintsTable() {
    try {
        console.log("Adding columns to complaints table...");
        await pool.query(`
            ALTER TABLE complaints 
            ADD COLUMN IF NOT EXISTS booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
            ADD COLUMN IF NOT EXISTS provider_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            ADD COLUMN IF NOT EXISTS provider_response TEXT,
            ADD COLUMN IF NOT EXISTS provider_responded_at TIMESTAMP WITHOUT TIME ZONE;
        `);
        console.log("Successfully altered complaints table.");
    } catch (error) {
        console.error("Error altering complaints table:", error);
    } finally {
        pool.end();
    }
}

alterComplaintsTable();
