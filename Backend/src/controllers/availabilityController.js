const pool = require('../db');

// Providers manage their own availability slots

exports.createAvailability = async (req, res) => {
    try {
        const userId = req.user.id;
        const { day_of_week, start_time, end_time } = req.body;

        if (!day_of_week || !start_time || !end_time) {
            return res.status(400).json({ message: "day_of_week, start_time and end_time are required" });
        }

        // simple time validation - assuming HH:MM(:SS) format
        if (end_time <= start_time) {
            return res.status(400).json({ message: "end_time must be after start_time" });
        }

        const profile = await pool.query(
            "SELECT id FROM provider_profiles WHERE user_id = $1",
            [userId]
        );

        if (profile.rows.length === 0) {
            return res.status(404).json({ message: "Provider profile not found" });
        }

        const providerId = profile.rows[0].id;

        const newSlot = await pool.query(
            `INSERT INTO availabilities
             (provider_id, day_of_week, start_time, end_time)
             VALUES ($1,$2,$3,$4) RETURNING *`,
            [providerId, day_of_week, start_time, end_time]
        );

        res.status(201).json({
            message: "Availability created",
            availability: newSlot.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.getMyAvailability = async (req, res) => {
    try {
        const userId = req.user.id;

        const profile = await pool.query(
            "SELECT id FROM provider_profiles WHERE user_id = $1",
            [userId]
        );

        if (profile.rows.length === 0) {
            return res.status(404).json({ message: "Provider profile not found" });
        }

        const providerId = profile.rows[0].id;

        const slots = await pool.query(
            `SELECT * FROM availabilities
             WHERE provider_id = $1
             ORDER BY day_of_week, start_time`,
            [providerId]
        );

        res.json(slots.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.deleteAvailability = async (req, res) => {
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

        const providerId = profile.rows[0].id;

        const slot = await pool.query(
            "SELECT * FROM availabilities WHERE id = $1",
            [id]
        );

        if (slot.rows.length === 0) {
            return res.status(404).json({ message: "Availability not found" });
        }

        if (slot.rows[0].provider_id !== providerId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await pool.query("DELETE FROM availabilities WHERE id = $1", [id]);
        res.json({ message: "Availability deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};