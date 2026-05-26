const pool = require('./src/db');

async function checkSchema() {
    try {
        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'complaints';
        `);
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        pool.end();
    }
}

checkSchema();
