const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/product/:productId", reviewController.getProductReviews);
router.post("/", verifyToken, reviewController.addReview);

module.exports = router;
