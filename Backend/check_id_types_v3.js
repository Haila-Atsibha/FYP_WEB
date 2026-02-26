require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
    try {
        const resB = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bookings' AND column_name IN ('id', 'customer_id', 'provider_id')");
        console.log("Bookings columns:");
        console.log(JSON.stringify(resB.rows, null, 2));

        const resU = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id'");
        console.log("Users columns:");
        console.log(JSON.stringify(resU.rows, null, 2));

        const resP = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'provider_profiles' AND column_name = 'id'");
        console.log("Provider Profiles columns:");
        console.log(JSON.stringify(resP.rows, null, 2));
    } catch (err) {
        console.error("DB ERROR: " + err.message);
    } finally {
        pool.end();
    }
}

check();
