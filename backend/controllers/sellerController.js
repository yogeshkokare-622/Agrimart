const OrderModel = require("../models/orderModel");
const ProductModel = require("../models/productModel");
const ExpenseModel = require("../models/expenseModel");

exports.getDashboardStats = async (req, res, next) => {
    try {
        const seller_id = req.userId;
        const orderStats = await OrderModel.getSellerAnalytics(seller_id);
        const productStats = await ProductModel.getSellerProductStats(seller_id);
        const financialStats = await ExpenseModel.getSellerStats(seller_id);
        
        res.json({
            ...orderStats,
            ...productStats,
            ...financialStats
        });
    } catch (err) {
        next(err);
    }
};

exports.getRecentOrders = async (req, res, next) => {
    try {
        const orders = await OrderModel.getBySeller(req.userId);
        res.json(orders.slice(0, 5));
    } catch (err) {
        next(err);
    }
};
