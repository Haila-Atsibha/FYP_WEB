require('dotenv').config();
const { getBadgeStats } = require('./src/controllers/notificationController');

async function testStats() {
    const req = {
        user: { id: 1, role: 'provider' } // Mock user
    };
    const res = {
        json: (data) => console.log("SUCCESS:", data),
        status: (code) => ({
            json: (err) => console.log(`ERROR ${code}:`, err)
        })
    };

    console.log("Testing getBadgeStats...");
    try {
        await getBadgeStats(req, res);
    } catch (e) {
        console.error("CRASH:", e);
    }
}

testStats();
