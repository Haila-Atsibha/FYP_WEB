const pool = require('../db');

exports.createService = async (req, res) => {
    try {
        const userId = req.user.id;
        const { category_id, title, description, price } = req.body;

        if (!category_id || !title || !price) {
            return res.status(400).json({
                message: "Category, title and price are required"
            });
        }

        // 1️⃣ Find provider profile
        const profile = await pool.query(
            "SELECT * FROM provider_profiles WHERE user_id = $1",
            [userId]
        );

        if (profile.rows.length === 0) {
            return res.status(404).json({
                message: "Provider profile not found"
            });
        }

        const providerProfileId = profile.rows[0].id;

        // 2️⃣ Check if category exists
        const category = await pool.query(
            "SELECT * FROM service_categories WHERE id = $1",
            [category_id]
        );

        if (category.rows.length === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        // 3️⃣ Insert service
        const newService = await pool.query(
            `INSERT INTO services 
            (provider_id, category_id, title, description, price)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [providerProfileId, category_id, title, description, price]
        );

        res.status(201).json({
            message: "Service created successfully",
            service: newService.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error
        });
    }
};


exports.getAllServices = async (req, res) => {
    try {
        const { category, q } = req.query;
        let query = `
            SELECT s.*, c.name AS category_name, u.name AS provider_name
            FROM services s
            LEFT JOIN service_categories c ON s.category_id = c.id
            LEFT JOIN provider_profiles pp ON s.provider_id = pp.id
            LEFT JOIN users u ON pp.user_id = u.id
            WHERE 1=1
        `;
        const values = [];
        let idx = 1;

        if (category) {
            query += ` AND s.category_id = $${idx++}`;
            values.push(category);
        }

        if (q) {
            query += ` AND (LOWER(s.title) LIKE $${idx} OR LOWER(s.description) LIKE $${idx})`;
            values.push(`%${q.toLowerCase()}%`);
            idx++;
        }

        query += ` ORDER BY s.created_at DESC`;

        const services = await pool.query(query, values);
        res.json(services.rows);

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error
        });
    }
};


exports.getServiceById = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await pool.query(`
            SELECT s.*, c.name AS category_name
            FROM services s
            LEFT JOIN service_categories c ON s.category_id = c.id
            WHERE s.id = $1
        `, [id]);

        if (service.rows.length === 0) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.json(service.rows[0]);

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error
        });
    }
};

// ---------- additional controller actions ----------

exports.updateService = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { title, description, price } = req.body;

        // ensure provider profile exists for this user
        const profile = await pool.query(
            "SELECT id FROM provider_profiles WHERE user_id = $1",
            [userId]
        );

        if (profile.rows.length === 0) {
            return res.status(404).json({ message: "Provider profile not found" });
        }

        const providerProfileId = profile.rows[0].id;

        // fetch the service
        const svc = await pool.query(
            "SELECT * FROM services WHERE id = $1",
            [id]
        );

        if (svc.rows.length === 0) {
            return res.status(404).json({ message: "Service not found" });
        }

        const existing = svc.rows[0];
        if (existing.provider_id !== providerProfileId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        // build dynamic update
        const updates = [];
        const values = [];
        let idx = 1;

        if (title !== undefined) {
            updates.push(`title = $${idx++}`);
            values.push(title);
        }
        if (description !== undefined) {
            updates.push(`description = $${idx++}`);
            values.push(description);
        }
        if (price !== undefined) {
            updates.push(`price = $${idx++}`);
            values.push(price);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: "No fields provided for update" });
        }

        const query = `UPDATE services SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`;
        values.push(id);

        const updated = await pool.query(query, values);

        res.json({
            message: "Service updated successfully",
            service: updated.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error
        });
    }
};

exports.deleteService = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const profile = await pool.query(
            "SELECT id FROM provider_profiles WHERE user_id = $1",
            [userId]
        );

        if (profile.rows.length === 0) {
            return res.status(404).json({ message: "Provider profile not found" });
        }

        const providerProfileId = profile.rows[0].id;

        const svc = await pool.query(
            "SELECT * FROM services WHERE id = $1",
            [id]
        );

        if (svc.rows.length === 0) {
            return res.status(404).json({ message: "Service not found" });
        }

        if (svc.rows[0].provider_id !== providerProfileId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await pool.query("DELETE FROM services WHERE id = $1", [id]);
        res.json({ message: "Service deleted successfully" });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error
        });
    }
};
