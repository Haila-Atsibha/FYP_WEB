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
    getProviderStats,
    getMyCategories,
    getUnavailability,
    addUnavailability,
    deleteUnavailability
} = require('../controllers/providerController');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Protected provider routes (Move static routes above dynamic ones)
router.get(
    '/my-categories',
    protect,
    authorizeRoles('provider'),
    getMyCategories
);

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

router.get(
    '/me/unavailability',
    protect,
    authorizeRoles('provider'),
    getUnavailability
);

// Public routes
router.get('/', getPublicProviders);
router.get('/top', getTopProviders);

router.get('/:id/unavailability', getUnavailability);

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
    upload.single('profileImage'),
    updateMyProfile
);

router.post(
    '/profile/unavailability',
    protect,
    authorizeRoles('provider'),
    addUnavailability
);

router.delete(
    '/profile/unavailability/:id',
    protect,
    authorizeRoles('provider'),
    deleteUnavailability
);

module.exports = router;
