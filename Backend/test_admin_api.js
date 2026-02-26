require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Create a mock admin token
const adminUser = { id: 1, role: 'admin', email: 'admin@example.com' };
const token = jwt.sign(adminUser, process.env.JWT_SECRET, { expiresIn: '1h' });

async function test() {
    try {
        console.log("Testing /api/admin/stats with token...");
        const res = await axios.get('http://localhost:5000/api/admin/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Response status:", res.status);
        console.log("Response data:", JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error("Test failed!");
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", err.response.data);
        } else {
            console.error(err.message);
        }
    }
}

test();
