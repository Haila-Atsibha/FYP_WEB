const express = require('express');
const router = express.Router();

const protect = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require('../controllers/categoriesController');

router.post(
    '/',
    protect,
    authorizeRoles('admin'),
    createCategory
);

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

router.put(
    '/:id',
    protect,
    authorizeRoles('admin'),
    updateCategory
);

router.delete(
    '/:id',
    protect,
    authorizeRoles('admin'),
    deleteCategory
);

module.exports = router;
