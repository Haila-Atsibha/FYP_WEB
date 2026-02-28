const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const {
    createProviderProfile,
    getMyProfile,
    updateMyProfile,
    getPublicProviders,
    getTopProviders,
    getProviderStats
} = require('../controllers/providerController');

// Protected provider routes (Move static routes above dynamic ones)
router.get(
    '/stats',
    protect,
    authorizeRoles('provider'),
    getProviderStats
);

router.get(
    '/profile/me',
    protect,
    authorizeRoles('provider'),
    getMyProfile
);

// Public routes
router.get('/', getPublicProviders);
router.get('/top', getTopProviders);

router.get('/:id', (req, res, next) => {
    // Controller is imported below
    const { getPublicProviderProfile } = require('../controllers/providerController');
    return getPublicProviderProfile(req, res, next);
});

router.post(
    '/profile',
    protect,
    authorizeRoles('provider'),
    createProviderProfile
);

router.put(
    '/profile',
    protect,
    authorizeRoles('provider'),
    updateMyProfile
);

module.exports = router;
