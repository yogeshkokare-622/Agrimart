const express = require("express");
const router = express.Router();
const sellerController = require("../controllers/sellerController");
const { verifyToken, requireSellerOrAdmin } = require("../middlewares/authMiddleware");

router.use(verifyToken);
router.use(requireSellerOrAdmin);

router.get("/stats", sellerController.getDashboardStats);
router.get("/recent-orders", sellerController.getRecentOrders);

module.exports = router;
