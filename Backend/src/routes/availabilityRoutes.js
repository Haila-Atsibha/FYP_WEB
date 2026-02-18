const express = require('express');
const router = express.Router();

const {
    createAvailability,
    getMyAvailability,
    deleteAvailability
} = require('../controllers/availabilityController');

const protect = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

// all provider endpoints
router.use(protect, authorizeRoles('provider'));

router.post('/', createAvailability);
router.get('/me', getMyAvailability);
router.delete('/:id', deleteAvailability);

module.exports = router;