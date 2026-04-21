/**
 * Centralized error handler middleware.
 * Always place LAST in app.use() chain.
 */
const errorHandler = (err, req, res, next) => {
    // MySQL errors
    if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ success: false, message: "Duplicate entry (email exists)" });
    }
    if (err.code === "ER_NO_SUCH_TABLE" || err.code === "ER_ACCESS_DENIED_ERROR") {
        return res.status(503).json({
            success: false,
            message: `Database unavailable (${err.code}): ${err.message}`,
            fix: "1. mysql -u root agrimart < database/agrimart.sql"
        });
    }

    // Structured service errors
    if (err.status && err.message) {
        return res.status(err.status).json({ success: false, message: err.message });
    }

    // JWT errors
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        return res.status(401).json({ success: false, message: "Authentication failed: Invalid or expired token" });
    }

    // Multer errors (file upload)
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File too large (max 5MB)" });
    }

    // Generic fallback
    console.error("❌ INTERNAL SERVER ERROR");
    console.error("Path:", req.method, req.url);
    console.error("Message:", err.message || err);
    if (err.stack) console.error("Stack:", err.stack);
    if (err.code) console.error("Code:", err.code);

    res.status(500).json({
        success: false,
        message: "An internal server error occurred",
        error: err.message || "Unknown error",
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = errorHandler;
