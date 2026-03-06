const express = require('express');
const router = express.Router();
const platformRatingController = require('../controllers/platformRatingController');
const protect = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

router.use(protect);

router.post('/platform', platformRatingController.submitRating);
router.get('/platform/stats', authorizeRoles('admin'), platformRatingController.getPlatformStats);

module.exports = router;
