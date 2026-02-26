require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function checkSchema() {
    try {
        console.log("--- bookings ---");
        const resB = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bookings'");
        resB.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

        console.log("--- provider_profiles ---");
        const resP = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'provider_profiles'");
        resP.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
    } catch (err) {
        console.error("DB ERROR:", err.message);
    } finally {
        pool.end();
    }
}

checkSchema();
