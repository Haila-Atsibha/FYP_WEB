const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { registerUser, loginUser, verifyEmail, resendOtp, forgotPassword, resetPassword, verifyResetOtp, updateFcmToken } = require('../controllers/authController');
const protect = require('../middlewares/authMiddleware');

// registration expects multipart/form-data with three files and optional categories array
router.post(
    '/register',
    upload.fields([
        { name: 'profileImage', maxCount: 1 },
        { name: 'nationalId', maxCount: 2 },
        { name: 'verificationSelfie', maxCount: 1 },
        { name: 'educationalDocuments', maxCount: 10 }
    ]),
    registerUser
);
router.post('/login', loginUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);
router.post('/fcm-token', protect, updateFcmToken);

module.exports = router;
