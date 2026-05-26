require('dotenv').config();
const pool = require('./src/db');

const updateEmail = async () => {
    try {
        const newEmail = process.env.EMAIL_USER;
        if (!newEmail) throw new Error('EMAIL_USER is not defined in .env');

        const res = await pool.query("UPDATE users SET email = $1 WHERE email = 'admin@test.com'", [newEmail]);
        console.log(`Updated ${res.rowCount} admin records to ${newEmail}`);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        pool.end();
    }
};

updateEmail();
