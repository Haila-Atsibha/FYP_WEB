require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function migrate() {
    try {
        console.log("Starting migration...");

        // 1. Update provider_profiles table
        await pool.query(`
            ALTER TABLE provider_profiles 
            ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'inactive',
            ADD COLUMN IF NOT EXISTS subscription_expiry DATE;
        `);
        console.log("Updated provider_profiles table.");

        // 2. Create payments table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                provider_id INTEGER REFERENCES provider_profiles(id) ON DELETE CASCADE,
                tx_ref VARCHAR(255) UNIQUE NOT NULL,
                amount NUMERIC NOT NULL,
                status VARCHAR(50) NOT NULL,
                payment_method VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Created payments table.");

        console.log("Migration completed successfully!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await pool.end();
    }
}

migrate();
