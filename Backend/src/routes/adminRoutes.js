const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const {
    getPendingUsers,
    approveUser,
    rejectUser
} = require('../controllers/adminController');

// all admin endpoints require authentication and admin role
router.use(protect, authorizeRoles('admin'));

router.get('/pending-users', getPendingUsers);
// approval endpoint accepts PUT (existing) and POST for compatibility
router.put('/approve/:id', approveUser);
router.post('/approve/:id', approveUser);
router.put('/reject/:id', rejectUser);

module.exports = router;