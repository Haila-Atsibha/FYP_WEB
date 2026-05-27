const axios = require('axios');

const start = async () => {
    const supabaseUrl = 'https://aeozrauzceiegcbafssv.supabase.co';
    const serviceKey = process.env.SUPABASE_KEY;

    try {
        console.log('Fetching user details for hmamulat_customer@gmail.com...');
        const response = await axios.get(`${supabaseUrl}/rest/v1/users?email=eq.hmamulat_customer@gmail.com`, {
            headers: {
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`
            }
        });

        console.log('User details:');
        console.log(JSON.stringify(response.data, null, 2));

    } catch (err) {
        console.error('REST API Request failed:', err.response?.data || err.message);
    }
};

start();
