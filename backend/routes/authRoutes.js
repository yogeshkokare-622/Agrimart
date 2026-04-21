const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const authController = require("../controllers/authController");
const { authLimiter } = require("../middlewares/rateLimiter");
const { registerRules, loginRules, updateProfileRules, validate } = require("../middlewares/validators");

// Public (rate-limited)
router.post("/register", authLimiter, registerRules, validate, authController.register);
router.post("/login", authLimiter, loginRules, validate, authController.login);

// Protected
router.get("/profile", verifyToken, authController.getProfile);
router.put("/profile", verifyToken, updateProfileRules, validate, authController.updateProfile);
router.post("/logout", verifyToken, authController.logout);

module.exports = router;