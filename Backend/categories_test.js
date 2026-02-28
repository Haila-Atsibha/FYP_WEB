require('dotenv').config();
const { getAllCategories } = require('./src/controllers/categoriesController');

async function test() {
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
        console.log("\n--- Testing getAllCategories ---");
        await getAllCategories({}, mockRes);

    } catch (e) {
        console.error("CRASHED:", e);
    }
}

test();
