require('dotenv').config();
const { getProviderStats } = require('./src/controllers/providerController');
const { getProviderBookings } = require('./src/controllers/bookingController');
const { getMyServices } = require('./src/controllers/serviceController');

async function test() {
    const mockUser = { id: 1, role: 'provider' }; // Adjust ID if needed
    const mockRes = {
        status: function (s) {
            this.statusCode = s;
            console.log("Status set to", s);
            return this;
        },
        json: function (j) {
            console.log("JSON response:", JSON.stringify(j, null, 2));
            return this;
        }
    };

    try {
        console.log("\n--- Testing getProviderStats ---");
        await getProviderStats({ user: mockUser }, mockRes);

        console.log("\n--- Testing getProviderBookings ---");
        await getProviderBookings({ user: mockUser }, mockRes);

        console.log("\n--- Testing getMyServices ---");
        await getMyServices({ user: mockUser }, mockRes);

    } catch (e) {
        console.error("CRASHED:", e);
    }
}

test();
