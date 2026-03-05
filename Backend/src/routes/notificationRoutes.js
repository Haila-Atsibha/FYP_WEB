const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    getBadgeStats,
    markByType
} = require('../controllers/notificationController');

router.use(protect); // All notification routes require authentication

router.get('/stats', getBadgeStats);
router.put('/mark-type', markByType);

router.get('/', getMyNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

module.exports = router;
