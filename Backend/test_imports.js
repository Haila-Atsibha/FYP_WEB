try {
    const authController = require('./src/controllers/authController');
    const adminController = require('./src/controllers/adminController');
    const authRoutes = require('./src/routes/authRoutes');
    console.log("IMPORT_SUCCESS");
} catch (e) {
    console.error("IMPORT_ERROR:", e.message, e.stack);
}
