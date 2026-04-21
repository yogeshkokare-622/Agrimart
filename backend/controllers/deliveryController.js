const OrderService = require("../services/orderService");
const UserModel    = require("../models/userModel");

exports.getAssignedOrders = async (req, res, next) => {
    try {
        const orders = await OrderService.getDeliveryOrders(req.userId);
        res.json(orders);
    } catch (err) {
        next(err);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const { orderId, status } = req.body;
        const result = await OrderService.updateOrderStatus(orderId, status, req.userId, req.userRole);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

exports.getDeliveryPartners = async (req, res, next) => {
    try {
        const partners = await UserModel.getDeliveryPartners();
        res.json(partners);
    } catch (err) {
        next(err);
    }
};
