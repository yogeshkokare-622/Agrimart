const rateLimit = require("express-rate-limit");

/**
 * Rate limiter for auth endpoints (login/register).
 * Prevents brute-force attacks.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,                   // 20 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests. Please try again after 15 minutes." },
});

/**
 * General API rate limiter.
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests. Please slow down." },
});

module.exports = { authLimiter, apiLimiter };
