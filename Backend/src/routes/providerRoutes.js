const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const { createProviderProfile, getMyProfile } = require('../controllers/providerController');

router.post(
    '/profile',
    protect,
    authorizeRoles('provider'),
    createProviderProfile
);

router.get(
    '/profile/me',
    protect,
    authorizeRoles('provider'),
    getMyProfile
);

module.exports = router;
