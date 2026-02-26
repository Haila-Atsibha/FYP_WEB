require('dotenv').config();
const pool = require('./src/db');

async function migrate() {
    try {
        console.log("Creating notifications table...");
        await pool.query('DROP TABLE IF EXISTS notifications');
        await pool.query(`
      CREATE TABLE notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'system',
        is_read BOOLEAN DEFAULT false,
        link TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log("Notifications table created successfully.");
    } catch (err) {
        console.error("Migration failed:");
        console.error("Message:", err.message);
        console.error("Code:", err.code);
    } finally {
        pool.end();
    }
}

migrate();
