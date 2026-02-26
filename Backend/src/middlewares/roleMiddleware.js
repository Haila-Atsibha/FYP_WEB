const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            console.warn(`Role verification failed for user: ${req.user ? req.user.id : 'unknown'}. Role: ${req.user ? req.user.role : 'none'}. Allowed: ${allowedRoles}`);
            return res.status(403).json({
                message: "Access denied: insufficient permissions",
                userRole: req.user ? req.user.role : null,
                allowedRoles: allowedRoles
            });
        }
        next();
    };
};

module.exports = authorizeRoles;
