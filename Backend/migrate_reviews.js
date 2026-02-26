require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function migrate() {
    try {
        console.log("Checking if reviews table exists...");
        const checkTable = await pool.query("SELECT * FROM information_schema.tables WHERE table_name = 'reviews'");

        if (checkTable.rows.length === 0) {
            console.log("Creating reviews table...");
            await pool.query(`
        CREATE TABLE reviews (
          id SERIAL PRIMARY KEY,
          booking_id INTEGER NOT NULL UNIQUE,
          provider_id INTEGER NOT NULL DEFAULT 0,
          service_id INTEGER NOT NULL DEFAULT 0,
          customer_id INTEGER NOT NULL DEFAULT 0,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (booking_id) REFERENCES bookings(id),
          FOREIGN KEY (provider_id) REFERENCES provider_profiles(id),
          FOREIGN KEY (service_id) REFERENCES services(id),
          FOREIGN KEY (customer_id) REFERENCES users(id)
        )
      `);
            console.log("Reviews table created successfully.");
        } else {
            console.log("Reviews table already exists.");
        }
    } catch (err) {
        console.error("MIGRATION ERROR:", err.message);
    } finally {
        pool.end();
    }
}

migrate();
