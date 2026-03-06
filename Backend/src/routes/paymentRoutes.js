const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const protect = require('../middlewares/authMiddleware');

// Initialize payment - Protected (only for providers)
router.post('/subscribe', protect, paymentController.initializePayment);

// Verify payment - Public (called by Chapa or redirected frontend)
router.get('/verify-payment/:tx_ref', paymentController.verifyPayment);

module.exports = router;
