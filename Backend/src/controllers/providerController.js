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

        const profile = await pool.query(
            "SELECT * FROM provider_profiles WHERE user_id = $1",
            [userId]
        );

        if (profile.rows.length === 0) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        res.json(profile.rows[0]);

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error
        });
    }
};
