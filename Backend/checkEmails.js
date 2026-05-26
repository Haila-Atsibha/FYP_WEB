require('dotenv').config();
const pool = require('./src/db');

const checkEmails = async () => {
    try {
        const res = await pool.query("SELECT id, role, email FROM users WHERE email IN ('hmamulat@gmail.com', 'admin@test.com')");
        console.log(res.rows);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        pool.end();
    }
};

checkEmails();
