const pool = require('../db');

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const newCategory = await pool.query(
            "INSERT INTO service_categories (name, description) VALUES ($1, $2) RETURNING *",
            [name, description]
        );

        res.status(201).json({
            message: "Category created successfully",
            category: newCategory.rows[0]
        });

    } catch (error) {

        if (error.code === '23505') {
            return res.status(400).json({
                message: "Category already exists"
            });
        }

        res.status(500).json({
            message: "Server error",
            error
        });
    }
};


exports.getAllCategories = async (req, res) => {
    try {
        const categories = await pool.query(
            "SELECT * FROM service_categories ORDER BY created_at DESC"
        );

        res.json(categories.rows);

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error
        });
    }
};


exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await pool.query(
            "SELECT * FROM service_categories WHERE id = $1",
            [id]
        );

        if (category.rows.length === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.json(category.rows[0]);

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error
        });
    }
};


exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await pool.query(
            "DELETE FROM service_categories WHERE id = $1 RETURNING *",
            [id]
        );

        if (deleted.rows.length === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.json({
            message: "Category deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error
        });
    }
};
