require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
    try {
        const res = await pool.query("SELECT data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'id'");
        console.log('RESULT_START');
        if (res.rows.length > 0) {
            console.log('TYPE=' + res.rows[0].data_type);
        } else {
            console.log('NOT_FOUND');
        }
        console.log('RESULT_END');
    } catch (err) {
        console.error("ERROR=" + err.message);
    } finally {
        pool.end();
    }
}

check();
