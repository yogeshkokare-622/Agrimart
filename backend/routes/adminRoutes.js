const express          = require("express");
const router           = express.Router();
const adminController  = require("../controllers/adminController");
const { verifyToken, requireAdmin } = require("../middlewares/authMiddleware");
const { updateStatusRules, validate } = require("../middlewares/validators");

// All admin routes require authentication + admin role
router.use(verifyToken, requireAdmin);

// Stats
router.get("/stats", adminController.getDashboardStats);

// User Management
router.get("/users", adminController.getAllUsers);
router.patch("/users/:id/toggle-block", adminController.toggleUserBlock);
router.delete("/users/:id", adminController.deleteUser);

// Seller Management
router.get("/sellers", adminController.getAllSellers);
router.patch("/sellers/:id/approve", adminController.approveSeller);
router.patch("/sellers/:id/reject", adminController.rejectSeller);

// Order Management
router.get("/orders", adminController.getAllOrders);
router.patch("/orders/:id/status", updateStatusRules, validate, adminController.updateOrderStatus);

// Delivery Management
router.post("/assign-delivery", adminController.assignDeliveryPerson);

module.exports = router;
