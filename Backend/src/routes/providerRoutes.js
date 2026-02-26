const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const {
    createProviderProfile,
    getMyProfile,
    updateMyProfile,
    getPublicProviders,
    getTopProviders
} = require('../controllers/providerController');

// Public routes
router.get('/', getPublicProviders);
router.get('/top', getTopProviders);

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

router.put(
    '/profile',
    protect,
    authorizeRoles('provider'),
    updateMyProfile
);

module.exports = router;
