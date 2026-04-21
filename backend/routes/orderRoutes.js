const express          = require("express");
const router           = express.Router();
const orderController  = require("../controllers/orderController");
const { verifyToken, requireAdmin } = require("../middlewares/authMiddleware");
const { createOrderRules, updateStatusRules, validate } = require("../middlewares/validators");

router.post("/",               verifyToken, createOrderRules, validate, orderController.createOrder);
router.get("/",                verifyToken, orderController.getOrders);
router.get("/buyer",           verifyToken, orderController.getOrders);
router.get("/seller",          verifyToken, orderController.getSellerOrders);

router.patch("/:id/status",    verifyToken, updateStatusRules, validate, orderController.updateOrderStatus);
router.patch("/:id/assign",    verifyToken, orderController.assignDelivery);
router.get("/:id/track",       verifyToken, orderController.getOrderTrack);
router.get("/:id",             verifyToken, orderController.getOrderDetails);

// Admin only
router.get("/admin/all",       verifyToken, requireAdmin, orderController.getAllOrders);


module.exports = router;
