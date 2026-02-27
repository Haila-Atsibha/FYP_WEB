const express = require('express');
const router = express.Router();

const {
    createBooking,
    getMyBookings,
    getProviderBookings,
    updateBookingStatus
} = require('../controllers/bookingController');

const protect = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

// create booking - customer only
router.post('/', protect, authorizeRoles('customer'), createBooking);

// get bookings for logged-in customer
router.get('/my', protect, authorizeRoles('customer'), getMyBookings);

// get bookings for provider
router.get('/provider', protect, authorizeRoles('provider'), getProviderBookings);

// get single booking
router.get('/:id', protect, (req, res, next) => {
    const { getBookingById } = require('../controllers/bookingController');
    return getBookingById(req, res, next);
});

// update status (customer or provider depending on action)
router.put('/:id/status', protect, updateBookingStatus);

module.exports = router;