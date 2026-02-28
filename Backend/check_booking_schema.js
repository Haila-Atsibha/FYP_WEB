require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const fs = require('fs');

async function check() {
    try {
        let output = "";
        const tables = ['bookings', 'messages', 'notifications', 'services', 'provider_profiles', 'service_categories', 'users'];
        for (const t of tables) {
            const res = await pool.query(
                "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 AND table_schema = 'public'",
                [t]
            );
            output += `\nTable: ${t}\n`;
            res.rows.forEach(r => {
                output += `- ${r.column_name}: ${r.data_type}\n`;
            });
        }
        fs.writeFileSync('schema_dump.txt', output);
        console.log("Schema dumped to schema_dump.txt");
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
check();
