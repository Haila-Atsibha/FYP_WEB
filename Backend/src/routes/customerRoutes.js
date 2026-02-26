const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const { getCustomerStats } = require('../controllers/customerController');

router.get('/stats', protect, authorizeRoles('customer'), getCustomerStats);

module.exports = router;
