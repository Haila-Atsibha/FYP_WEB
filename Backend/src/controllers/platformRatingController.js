const pool = require('../db');

exports.submitRating = async (req, res) => {
    try {
        const userId = req.user.id;
        const { rating, feedback } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Valid rating (1-5) is required" });
        }

        const result = await pool.query(
            "INSERT INTO platform_ratings (user_id, rating, feedback) VALUES ($1, $2, $3) RETURNING *",
            [userId, rating, feedback]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error submitting platform rating:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getPlatformStats = async (req, res) => {
    try {
        const stats = await pool.query("SELECT AVG(rating) as avg_rating, COUNT(*) as total_ratings FROM platform_ratings");
        const recentFeedback = await pool.query(`
            SELECT r.*, u.name as user_name 
            FROM platform_ratings r
            JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
            LIMIT 5
        `);

        res.json({
            avgRating: parseFloat(stats.rows[0].avg_rating || 0).toFixed(1),
            totalRatings: parseInt(stats.rows[0].total_ratings),
            recentFeedback: recentFeedback.rows
        });
    } catch (error) {
        console.error("Error fetching platform stats:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
