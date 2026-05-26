require('dotenv').config({ path: '../.env' });
const pool = require('./db');

async function createTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS provider_unavailability (
                id SERIAL PRIMARY KEY,
                provider_id INTEGER REFERENCES provider_profiles(id) ON DELETE CASCADE,
                date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Table provider_unavailability created successfully.");
    } catch (e) {
        console.error("Error creating table:", e);
    } finally {
        pool.end();
    }
}

createTable();
