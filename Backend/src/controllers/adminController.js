const pool = require('../db');

exports.getPendingUsers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, status, profile_image_url, national_id_url, verification_selfie_url
             FROM users WHERE status='pending'`
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.approveUser = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "UPDATE users SET status='approved' WHERE id=$1 RETURNING *",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User approved', user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.rejectUser = async (req, res) => {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason) {
        return res.status(400).json({ message: 'Rejection reason is required' });
    }

    try {
        const result = await pool.query(
            "UPDATE users SET status='rejected', rejection_reason=$2 WHERE id=$1 RETURNING *",
            [id, rejection_reason]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User rejected', user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};