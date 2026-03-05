const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const {
    createReview,
    getServiceReviews,
    getProviderReviews,
    getMyReviews
} = require('../controllers/reviewController');

// customer creates review
router.post('/', protect, authorizeRoles('customer'), createReview);

// public: reviews for a service
router.get('/service/:service_id', getServiceReviews);

// public: reviews for a provider
router.get('/provider/:provider_id', getProviderReviews);

// provider: reviews for self
router.get('/me', protect, authorizeRoles('provider'), getMyReviews);

module.exports = router;
