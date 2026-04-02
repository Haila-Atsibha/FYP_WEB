const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const { getCustomerStats, getCustomerProfile, updateCustomerProfile } = require('../controllers/customerController');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/stats', protect, authorizeRoles('customer', 'admin'), getCustomerStats);

router.get('/profile/me', protect, authorizeRoles('customer', 'admin'), getCustomerProfile);
router.put('/profile', protect, authorizeRoles('customer', 'admin'), upload.single('profileImage'), updateCustomerProfile);

module.exports = router;
