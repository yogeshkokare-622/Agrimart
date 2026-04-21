const { body, param, validationResult } = require("express-validator");

/**
 * Run validators and return 400 on failure.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.warn("⚠️ VALIDATION FAILED:", errors.array().map(e => `${e.path}: ${e.msg}`).join(", "));
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
        });
    }
    next();
};

// ── Auth ────────────────────────────────────────────────────
const registerRules = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("phone").trim().notEmpty().withMessage("Phone is required"),
    body("address").trim().notEmpty().withMessage("Address is required"),
    body("role").optional().isIn(["user", "seller", "delivery"]).withMessage("Role must be user, seller or delivery"),
];

const loginRules = [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
];

// ── Products ────────────────────────────────────────────────
const createProductRules = [
    body("name").trim().notEmpty().withMessage("Product name is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("price").isFloat({ gt: 0 }).withMessage("Price must be a positive number"),
    body("quantity").isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer"),
    body("category").optional().trim(),
];

const updateProductRules = [
    param("id").isInt().withMessage("Invalid product ID"),
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("price").optional().isFloat({ gt: 0 }).withMessage("Price must be positive"),
    body("quantity").optional().isInt({ min: 0 }).withMessage("Quantity must be non-negative"),
];

// ── Cart ────────────────────────────────────────────────────
const addToCartRules = [
    body("product_id").isInt().withMessage("Valid product ID is required"),
    body("quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

const updateCartRules = [
    param("productId").isInt().withMessage("Valid product ID is required"),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

// ── Orders ──────────────────────────────────────────────────
const createOrderRules = [
    body("product_id").isInt().withMessage("Valid product ID is required"),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

const updateStatusRules = [
    param("id").isInt().withMessage("Invalid order ID"),
    body("status").isIn(["Pending", "Accepted", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"])
        .withMessage("Invalid status value"),
];


// ── Profile ─────────────────────────────────────────────────
const updateProfileRules = [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("phone").optional().trim().notEmpty().withMessage("Phone cannot be empty"),
    body("address").optional().trim().notEmpty().withMessage("Address cannot be empty"),
];

module.exports = {
    validate,
    registerRules,
    loginRules,
    createProductRules,
    updateProductRules,
    addToCartRules,
    updateCartRules,
    createOrderRules,
    updateStatusRules,
    updateProfileRules,
};
