const express = require('express');
const router = express.Router();

const protect = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const {
    createService,
    getAllServices,
    getServiceById
} = require('../controllers/serviceController');

router.post(
    '/',
    protect,
    authorizeRoles('provider'),
    createService
);

router.get('/', getAllServices);
router.get('/:id', getServiceById);

module.exports = router;
