const express            = require("express");
const router             = express.Router();
const paymentController  = require("../controllers/paymentController");
const { verifyToken }    = require("../middlewares/authMiddleware");
const { body, param, validationResult } = require("express-validator");

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }
    next();
};

// Create payment for an order
router.post("/",
    verifyToken,
    body("order_id").isInt().withMessage("Valid order ID is required"),
    body("method").optional().isIn(["Online", "COD", "UPI", "Card"]).withMessage("Invalid payment method"),
    validate,
    paymentController.createPayment
);

// Get all my payments
router.get("/", verifyToken, paymentController.getMyPayments);

// Get payment details for a specific order
router.get("/order/:orderId",
    verifyToken,
    param("orderId").isInt().withMessage("Valid order ID is required"),
    validate,
    paymentController.getPaymentByOrder
);

module.exports = router;
