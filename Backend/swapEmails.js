require('dotenv').config();
const pool = require('./src/db');

const swapEmails = async () => {
    try {
        await pool.query('BEGIN');
        
        // 1. Change customer email to a temp email
        await pool.query("UPDATE users SET email = 'temp_hmamulat@gmail.com' WHERE email = 'hmamulat@gmail.com'");
        
        // 2. Change admin email to hmamulat@gmail.com
        await pool.query("UPDATE users SET email = 'hmamulat@gmail.com' WHERE email = 'admin@test.com'");
        
        // 3. Change customer temp email to hmamulat_customer@gmail.com
        await pool.query("UPDATE users SET email = 'hmamulat_customer@gmail.com' WHERE email = 'temp_hmamulat@gmail.com'");
        
        await pool.query('COMMIT');
        console.log("Emails swapped successfully. Admin is now hmamulat@gmail.com");
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error("Error:", err);
    } finally {
        pool.end();
    }
};

swapEmails();
