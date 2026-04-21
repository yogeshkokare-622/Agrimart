const express = require("express");
const router  = express.Router();
const deliveryController = require("../controllers/deliveryController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Only delivery persons can see their assigned orders
router.get("/orders", protect, authorize("delivery"), deliveryController.getAssignedOrders);

// Delivery status updates
router.patch("/update-status", protect, authorize("delivery", "admin"), deliveryController.updateStatus);

// Sellers/Admins can see delivery partners to assign them
router.get("/partners", protect, authorize("seller", "admin"), deliveryController.getDeliveryPartners);

module.exports = router;
