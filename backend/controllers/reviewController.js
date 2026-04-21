const ReviewModel = require("../models/reviewModel");
const OrderModel = require("../models/orderModel");

exports.addReview = async (req, res, next) => {
    try {
        const { product_id, rating, comment } = req.body;
        const user_id = req.userId;

        // Check if user already reviewed
        const alreadyReviewed = await ReviewModel.hasUserReviewed(product_id, user_id);
        if (alreadyReviewed) {
            return res.status(400).json({ message: "You have already reviewed this product" });
        }

        // Logic check: user should have purchased the product (optional but good)
        // For now, allow all logged in users.

        const reviewId = await ReviewModel.create({ product_id, user_id, rating, comment });
        res.status(201).json({ message: "Review added successfully", reviewId });
    } catch (err) {
        next(err);
    }
};

exports.getProductReviews = async (req, res, next) => {
    try {
        const reviews = await ReviewModel.getByProduct(req.params.productId);
        const ratingStats = await ReviewModel.getProductRating(req.params.productId);
        res.json({ reviews, ...ratingStats });
    } catch (err) {
        next(err);
    }
};
