const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const {
    createReview,
    getServiceReviews,
    getMyReviews
} = require('../controllers/reviewController');

// customer creates review
router.post('/', protect, authorizeRoles('customer'), createReview);

// public: reviews for a service
router.get('/service/:service_id', getServiceReviews);

// provider: reviews for self
router.get('/me', protect, authorizeRoles('provider'), getMyReviews);

module.exports = router;
