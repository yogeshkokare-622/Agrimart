const { verifyToken } = require("../utils/jwt");
const db = require("../config/db");

exports.protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: no token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = verifyToken(token);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        // 🛡️ SECURITY: Check if user is blocked or (if seller) approved
        const [[user]] = await db.query("SELECT id, role, is_blocked, is_approved FROM users WHERE id = ?", [decoded.id]);
        
        if (!user) {
            return res.status(401).json({ message: "User no longer exists" });
        }

        if (user.is_blocked) {
            return res.status(403).json({ message: "Your account has been blocked. Please contact support." });
        }

        req.userId = user.id;
        req.userRole = user.role;
        req.user = { 
            ...decoded, 
            ...user,
            isApproved: !!user.is_approved,
            isBlocked: !!user.is_blocked
        };
        
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Forbidden: This action requires one of these roles: ${roles.join(", ")}` 
            });
        }
        
        // Additional check for sellers
        if (req.user.role === 'seller' && !req.user.isApproved) {
            return res.status(403).json({ message: "Your seller account is pending approval." });
        }

        next();
    };
};

// Aliases for compatibility
exports.verifyToken = exports.protect;
exports.requireAdmin = exports.authorize("admin");
exports.requireSellerOrAdmin = exports.authorize("seller", "admin");
exports.requireSeller = exports.authorize("seller");
exports.requireDelivery = exports.authorize("delivery");