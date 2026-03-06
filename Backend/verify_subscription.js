require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function verify() {
    try {
        console.log("--- 1. Checking Database Columns ---");
        const profileCols = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'provider_profiles' 
            AND column_name IN ('subscription_status', 'subscription_expiry');
        `);
        console.log("Provider Profiles Columns:", profileCols.rows);

        console.log("\n--- 2. Checking Payments Table ---");
        const paymentsExist = await pool.query(`
            SELECT EXISTS (
               SELECT FROM information_schema.tables 
               WHERE  table_name = 'payments'
            );
        `);
        console.log("Payments Table Exists:", paymentsExist.rows[0].exists);

        if (paymentsExist.rows[0].exists) {
            const paymentCols = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'payments';
            `);
            console.log("Payments Table Columns:", paymentCols.rows.map(r => r.column_name));
        }

        console.log("\n--- 3. Verifying Filtering Logic (Dry Run) ---");
        const testQuery = `
            SELECT id FROM services s
            WHERE EXISTS (
                SELECT 1 FROM provider_profiles pp 
                WHERE s.provider_id = pp.id 
                AND pp.subscription_status = 'active' 
                AND pp.subscription_expiry > CURRENT_DATE
            ) LIMIT 1;
        `;
        // Just checking if syntax is correct
        await pool.query(testQuery);
        console.log("Filtering query syntax is valid.");

        console.log("\n--- Verification Complete ---");
    } catch (err) {
        console.error("Verification failed:", err);
    } finally {
        await pool.end();
    }
}

verify();
