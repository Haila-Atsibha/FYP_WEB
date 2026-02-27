require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const fs = require('fs');

async function dump() {
    try {
        const tables = [
            'users',
            'bookings',
            'messages',
            'notifications',
            'provider_profiles',
            'services',
            'service_categories',
            'provider_categories'
        ];
        let dump = "TABLE SCHEMA DUMP\n=================\n";

        for (const t of tables) {
            const res = await pool.query(
                "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position",
                [t]
            );
            dump += `\nTable: ${t}\n`;
            res.rows.forEach(r => {
                dump += `- ${r.column_name}: ${r.data_type}\n`;
            });
        }

        fs.writeFileSync('complete_schema_dump.txt', dump);
        console.log("Dump written to complete_schema_dump.txt");
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

dump();
