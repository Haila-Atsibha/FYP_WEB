const pool = require('./src/db');

async function debugSchema() {
    try {
        const tables = ['bookings', 'services', 'service_categories', 'provider_profiles', 'notifications'];
        for (const table of tables) {
            const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1", [table]);
            console.log(`--- ${table} ---`);
            res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
        }
    } catch (err) {
        console.error("DB ERROR DETAILS: ", err);
    } finally {
        pool.end();
    }
}

debugSchema();
