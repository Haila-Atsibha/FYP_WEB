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
        // Count providers based on those who have services in this category OR are explicitly linked
        const result = await pool.query(`
            SELECT 
                c.*, 
                COUNT(DISTINCT s.provider_id)::int as "providerCount"
            FROM service_categories c
            LEFT JOIN services s ON c.id = s.category_id
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("Get All Categories Error:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
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
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const result = await pool.query(
            "UPDATE service_categories SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
            [name, description, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.json({
            message: "Category updated successfully",
            category: result.rows[0]
        });

    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({
                message: "Category name already exists"
            });
        }
        res.status(500).json({
            message: "Server error",
            error
        });
    }
};
