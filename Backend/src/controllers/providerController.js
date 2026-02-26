const pool = require('../db');

exports.createProviderProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bio } = req.body;

        // Check if profile already exists
        const existingProfile = await pool.query(
            "SELECT * FROM provider_profiles WHERE user_id = $1",
            [userId]
        );

        if (existingProfile.rows.length > 0) {
            return res.status(400).json({
                message: "Provider profile already exists"
            });
        }

        const newProfile = await pool.query(
            "INSERT INTO provider_profiles (user_id, bio) VALUES ($1, $2) RETURNING *",
            [userId, bio]
        );

        res.status(201).json({
            message: "Provider profile created successfully",
            profile: newProfile.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error
        });
    }
};


exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Use LEFT JOIN to ensure we get user info even if no profile exists yet
        const result = await pool.query(
            `SELECT 
                u.id as user_id, u.name, u.email, u.phone, u.status AS user_status,
                p.id as profile_id, p.bio, p.average_rating, p.is_verified, p.verification_status
             FROM users u
             LEFT JOIN provider_profiles p ON u.id = p.user_id 
             WHERE u.id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Get My Profile Error:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

exports.updateMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bio, name, phone } = req.body;

        // Start a transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Update users table (name and phone)
            await client.query(
                "UPDATE users SET name = $1, phone = $2 WHERE id = $3",
                [name, phone, userId]
            );

            // Upsert provider_profiles table (bio)
            const updatedProfile = await client.query(
                `INSERT INTO provider_profiles (user_id, bio) 
                 VALUES ($1, $2) 
                 ON CONFLICT (user_id) 
                 DO UPDATE SET bio = EXCLUDED.bio 
                 RETURNING *`,
                [userId, bio]
            );

            await client.query('COMMIT');

            res.json({
                message: "Profile updated successfully",
                profile: updatedProfile.rows[0]
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error in updateMyProfile:", error);
        res.status(500).json({
            message: "Server error",
            error
        });
    }
};
exports.getPublicProviders = async (req, res) => {
    try {
        const { category } = req.query;
        let query = `
            SELECT 
                u.id, u.name, u.profile_image_url, 
                p.bio, p.average_rating, p.id as provider_profile_id,
                ARRAY_AGG(DISTINCT sc.name) as categories
            FROM users u
            JOIN provider_profiles p ON u.id = p.user_id
            LEFT JOIN (
                SELECT provider_id as user_id, category_id FROM provider_categories
                UNION
                SELECT p2.user_id, s.category_id FROM services s JOIN provider_profiles p2 ON s.provider_id = p2.id
            ) all_cats ON u.id = all_cats.user_id
            LEFT JOIN service_categories sc ON all_cats.category_id = sc.id
            WHERE u.status = 'approved'
        `;
        const values = [];

        if (category) {
            query += ` AND (
                EXISTS (SELECT 1 FROM services s2 WHERE s2.provider_id = p.id AND s2.category_id = $1)
                OR EXISTS (SELECT 1 FROM provider_categories pc WHERE pc.provider_id = u.id AND pc.category_id = $1)
            )`;
            values.push(category);
        }

        query += ` GROUP BY u.id, p.id ORDER BY p.average_rating DESC NULLS LAST`;

        const result = await pool.query(query, values);

        // Clean up categories (remove nulls)
        const cleaned = result.rows.map(row => ({
            ...row,
            categories: (row.categories || []).filter(c => c !== null)
        }));

        res.json(cleaned);

    } catch (error) {
        console.error("Get Public Providers Error:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

exports.getTopProviders = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.id, u.name, u.profile_image_url, 
                p.bio, p.average_rating, p.id as provider_profile_id,
                (SELECT COUNT(*) FROM bookings WHERE provider_id = p.id AND status = 'Completed') as "completedJobs",
                (SELECT name FROM service_categories sc 
                 JOIN services s ON sc.id = s.category_id 
                 WHERE s.provider_id = p.id 
                 LIMIT 1) as "category"
            FROM users u
            JOIN provider_profiles p ON u.id = p.user_id
            WHERE u.status = 'approved'
            ORDER BY p.average_rating DESC NULLS LAST
            LIMIT 6
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
