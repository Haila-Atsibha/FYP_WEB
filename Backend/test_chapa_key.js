require('dotenv').config();
const axios = require('axios');

async function testChapa() {
    const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
    console.log("Using Key (trimmed):", CHAPA_SECRET_KEY.trim());
    console.log("Length:", CHAPA_SECRET_KEY.trim().length);

    try {
        const response = await axios.post(
            'https://api.chapa.co/v1/transaction/initialize',
            {
                amount: 1, // Smallest amount
                currency: 'ETB',
                email: 'test@example.com',
                first_name: 'Test',
                tx_ref: `test-${Date.now()}`
            },
            {
                headers: {
                    Authorization: `Bearer ${CHAPA_SECRET_KEY.trim()}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log("SUCCESS:", response.data);
    } catch (e) {
        console.error("FAILED:", e.response?.data || e.message);
    }
}

testChapa();
