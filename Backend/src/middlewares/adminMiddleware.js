const jwt = require('jsonwebtoken');

// Make sure you have JWT_SECRET in your .env
const JWT_SECRET = process.env.JWT_SECRET;

const adminMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and has Bearer token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if user role is admin
        if (!decoded.role || decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // Attach user info to request for future use
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = adminMiddleware;
