require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
    try {
        const resU = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id'");
        console.log("USERS_ID_TYPE:", resU.rows[0].data_type);

        const resB = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'id'");
        console.log("BOOKINGS_ID_TYPE:", resB.rows[0].data_type);

        const resP = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'provider_profiles' AND column_name = 'id'");
        console.log("PROFILES_ID_TYPE:", resP.rows[0].data_type);
    } catch (err) {
        console.error("DB ERROR: " + err.message);
    } finally {
        pool.end();
    }
}
check();
