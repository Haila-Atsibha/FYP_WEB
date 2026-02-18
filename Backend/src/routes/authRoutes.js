const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { registerUser, loginUser } = require('../controllers/authController');

// registration expects multipart/form-data with three files and optional categories array
router.post(
    '/register',
    upload.fields([
        { name: 'profileImage', maxCount: 1 },
        { name: 'nationalId', maxCount: 1 },
        { name: 'verificationSelfie', maxCount: 1 }
    ]),
    registerUser
);
router.post('/login', loginUser);

module.exports = router;
