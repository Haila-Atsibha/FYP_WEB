const pool = require('./src/db');

async function inspect() {
    try {
        const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log("Tables:", res.rows.map(r => r.table_name));

        const tables = res.rows.map(r => r.table_name);
        if (tables.includes('notifications')) {
            const columns = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'notifications'");
            console.log("Notifications columns:", columns.rows);
        } else {
            console.log("No notifications table found.");
        }
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

inspect();
