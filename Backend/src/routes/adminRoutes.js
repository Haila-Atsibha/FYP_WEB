const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const {
    getPendingUsers,
    approveUser,
    rejectUser,
    getStats,
    getBookings,
    getUsers,
    getComplaints,
    getActivity,
    getSubscriptions,
    updateUserStatus,
    deleteUser
} = require('../controllers/adminController');
const { getAllCategories } = require('../controllers/categoriesController');

// all admin endpoints require authentication and admin role
router.use(protect, authorizeRoles('admin'));

router.get('/stats', getStats);
router.get('/bookings', getBookings);
router.get('/users', getUsers);
router.get('/complaints', getComplaints);
router.get('/activity', getActivity);
router.get('/subscriptions', getSubscriptions);
router.get('/categories', getAllCategories);
router.get('/pending-users', getPendingUsers);
// approval endpoint accepts PUT (existing) and POST for compatibility
router.put('/approve/:id', approveUser);
router.post('/approve/:id', approveUser);
router.put('/reject/:id', rejectUser);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

module.exports = router;
