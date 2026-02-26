const pool = require('../db');

exports.getPendingUsers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, status, profile_image_url, national_id_url, verification_selfie_url
             FROM users WHERE status='pending'`
        );
        const { getSignedUrl } = require('../utils/supabaseHelper');

        const usersWithSignedUrls = await Promise.all(result.rows.map(async (user) => {
            return {
                ...user,
                profile_image_url: await getSignedUrl(user.profile_image_url),
                national_id_url: await getSignedUrl(user.national_id_url),
                verification_selfie_url: await getSignedUrl(user.verification_selfie_url)
            };
        }));

        res.json(usersWithSignedUrls);
    } catch (error) {
        console.error("Get Pending Users Error:", error.message);
        res.status(500).json({ message: 'Server error while fetching pending users', error: error.message });
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
        console.error("Approve User Error:", error.message);
        res.status(500).json({ message: 'Server error while approving user', error: error.message });
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
        console.error("Reject User Error:", error.message);
        res.status(500).json({ message: 'Server error while rejecting user', error: error.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const stats = {};

        // 1. User Stats
        try {
            const usersCount = await pool.query("SELECT COUNT(*) FROM users");
            stats.totalUsers = parseInt(usersCount.rows[0].count);
        } catch (e) {
            console.error("Stats Error (Users Count):", e.message);
            stats.totalUsers = 0;
        }

        // 2. Booking Stats
        try {
            const bookingsStats = await pool.query(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE status = 'Active') as active,
                    COUNT(*) FILTER (WHERE status = 'Completed') as completed,
                    COUNT(*) FILTER (WHERE status = 'Cancelled') as cancelled,
                    SUM(total_price) FILTER (WHERE status = 'Completed') as revenue
                FROM bookings
            `);
            stats.totalBookings = parseInt(bookingsStats.rows[0].total);
            stats.activeBookings = parseInt(bookingsStats.rows[0].active);
            stats.completedBookings = parseInt(bookingsStats.rows[0].completed);
            stats.cancelledBookings = parseInt(bookingsStats.rows[0].cancelled);
            stats.totalRevenue = parseFloat(bookingsStats.rows[0].revenue || 0).toFixed(2);
        } catch (e) {
            console.error("Stats Error (Bookings):", e.message);
            stats.totalBookings = 0;
            stats.activeBookings = 0;
            stats.completedBookings = 0;
            stats.cancelledBookings = 0;
            stats.totalRevenue = "0.00";
        }

        // 3. Avg Rating
        try {
            const ratingResult = await pool.query("SELECT AVG(average_rating) FROM provider_profiles");
            stats.avgRating = parseFloat(ratingResult.rows[0].avg || 0).toFixed(1) + "/5";
        } catch (e) {
            console.error("Stats Error (Avg Rating):", e.message);
            stats.avgRating = "0.0/5";
        }

        // 4. Monthly Bookings Growth (last 6 months)
        try {
            const monthlyData = await pool.query(`
                SELECT 
                    to_char(created_at, 'Mon') as label,
                    COUNT(*) as value
                FROM bookings
                WHERE created_at >= NOW() - INTERVAL '6 months'
                GROUP BY to_char(created_at, 'Mon'), date_trunc('month', created_at)
                ORDER BY date_trunc('month', created_at)
            `);
            stats.monthlyData = {
                labels: monthlyData.rows.map(r => r.label),
                values: monthlyData.rows.map(r => parseInt(r.value))
            };
        } catch (e) {
            console.error("Stats Error (Monthly Data):", e.message);
            stats.monthlyData = { labels: [], values: [] };
        }

        // 5. Revenue Breakdown (last 4 weeks)
        try {
            const revenueData = await pool.query(`
                SELECT 
                    'Week ' || to_char(created_at, 'W') as label,
                    SUM(total_price) as value
                FROM bookings
                WHERE created_at >= NOW() - INTERVAL '4 weeks' AND status = 'Completed'
                GROUP BY to_char(created_at, 'W')
                ORDER BY to_char(created_at, 'W')
            `);
            stats.revenueData = {
                labels: revenueData.rows.map(r => r.label),
                values: revenueData.rows.map(r => parseFloat(r.value || 0))
            };
        } catch (e) {
            console.error("Stats Error (Revenue Data):", e.message);
            stats.revenueData = { labels: [], values: [] };
        }

        // 6. Top Service Categories
        try {
            const categoryData = await pool.query(`
                SELECT 
                    c.name as label,
                    COUNT(b.id) as value
                FROM service_categories c
                LEFT JOIN services s ON s.category_id = c.id
                LEFT JOIN bookings b ON b.service_id = s.id
                GROUP BY c.name
                ORDER BY value DESC
                LIMIT 4
            `);
            stats.categoryData = {
                labels: categoryData.rows.map(r => r.label),
                values: categoryData.rows.map(r => parseInt(r.value))
            };
        } catch (e) {
            console.error("Stats Error (Category Data):", e.message);
            stats.categoryData = { labels: [], values: [] };
        }

        res.json(stats);
    } catch (error) {
        console.error("Global Stats Error:", error);
        res.status(500).json({
            message: 'Server error while fetching dashboard stats',
            error: error.message || error
        });
    }
};

exports.getBookings = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                b.id, 
                customer.name as customer, 
                provider.name as provider,
                s.title as service, 
                b.status, 
                b.total_price as price,
                b.booking_date,
                b.created_at
            FROM bookings b
            JOIN users customer ON b.customer_id = customer.id
            JOIN users provider ON b.provider_id = provider.id
            JOIN services s ON b.service_id = s.id
            ORDER BY b.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error("Controller Error:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, name, email, role, status, created_at
            FROM users
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error("Controller Error:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const result = await pool.query(
            "UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, status",
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: `User status updated to ${status}`,
            user: result.rows[0]
        });
    } catch (error) {
        console.error("Update User Status Error:", error.message);
        res.status(500).json({ message: "Server error while updating user status", error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM users WHERE id = $1 RETURNING id, name",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "User deleted successfully",
            user: result.rows[0]
        });
    } catch (error) {
        console.error("Delete User Error:", error.message);
        res.status(500).json({ message: "Server error while deleting user", error: error.message });
    }
};

exports.getComplaints = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.name as "userName", n.title as subject, n.message, n.created_at, 'low' as priority, 'open' as status
            FROM notifications n
            JOIN users u ON n.user_id = u.id
            WHERE n.type = 'complaint'
            ORDER BY n.created_at DESC
            LIMIT 10
        `);
        res.json(result.rows);
    } catch (error) {
        console.error("Controller Error:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getActivity = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM (
                (SELECT u.name as "userName", 'registered as a ' || u.role as action, u.created_at as time
                 FROM users u)
                UNION ALL
                (SELECT u.name as "userName", 'booked ' || s.title as action, b.created_at as time
                 FROM bookings b
                 JOIN users u ON b.customer_id = u.id
                 JOIN services s ON b.service_id = s.id)
            ) AS combined_activity
            ORDER BY time DESC
            LIMIT 15
        `);

        // Simulating "X hours ago" or similar for the frontend until more robust date handling is added
        const formattedActivity = result.rows.map(act => ({
            ...act,
            time: act.time ? new Date(act.time).toLocaleString() : 'Recent'
        }));

        res.json(formattedActivity);
    } catch (error) {
        console.error("Activity Feed Error:", error.message);
        res.status(500).json({ message: 'Server error while fetching activity', error: error.message });
    }
};

exports.getSubscriptions = async (req, res) => {
    // Mocking subscriptions as they aren't fully implemented in DB yet
    res.json({
        monthlyRevenue: "0",
        activePremium: 0,
        expiringSoon: 0,
        streams: []
    });
};
