const express = require('express');
const router = express.Router();

const protect = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const {
    createService,
    getAllServices,
    getServiceById,
    getMyServices,
    updateService,
    deleteService
} = require('../controllers/serviceController');

router.post(
    '/',
    protect,
    authorizeRoles('provider'),
    createService
);

router.get('/me', protect, authorizeRoles('provider'), getMyServices);
router.get('/', getAllServices);
router.get('/:id', getServiceById);

router.put('/:id', protect, authorizeRoles('provider'), updateService);
router.delete('/:id', protect, authorizeRoles('provider'), deleteService);

module.exports = router;
