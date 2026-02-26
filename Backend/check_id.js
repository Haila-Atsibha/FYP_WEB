require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
pool.query("SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id'").then(res => {
    console.log('TYPE=' + res.rows[0].data_type);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
Simon
