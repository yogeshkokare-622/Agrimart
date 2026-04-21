const OrderService = require("../services/orderService");

exports.createOrder = async (req, res, next) => {
    try {
        const { product_id, quantity, items } = req.body;
        const buyer_id = req.userId;

        if (!buyer_id) return res.status(401).json({ success: false, message: "Unauthorized" });

        // Support both single item and bulk items
        const orderItems = items || [{ product_id, quantity }];
        
        const result = await OrderService.placeBulkOrder({ items: orderItems, buyer_id });
        return res.status(201).json({ success: true, ...result });
    } catch (err) {
        console.error('❌ ORDER CREATE ERROR:', err);
        next(err);
    }
};

exports.getOrders = async (req, res, next) => {
    try {
        if (!req.userId) return res.status(401).json({ success: false, message: "Unauthorized" });
        const orders = await OrderService.getMyOrders(req.userId);
        return res.json(orders || []);
    } catch (err) {
        console.error('❌ GET ORDERS ERROR:', err);
        next(err);
    }
};

exports.getSellerOrders = async (req, res, next) => {
    try {
        if (!req.userId) return res.status(401).json({ success: false, message: "Unauthorized" });
        const orders = await OrderService.getSellerOrders(req.userId);
        return res.json(orders || []);
    } catch (err) {
        console.error('❌ GET SELLER ORDERS ERROR:', err);
        next(err);
    }
};

exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ success: false, message: "Status is required" });

        const result = await OrderService.updateOrderStatus(
            req.params.id,
            status,
            req.userId,
            req.userRole
        );
        return res.json(result);
    } catch (err) {
        next(err);
    }
};

exports.assignDelivery = async (req, res, next) => {
    try {
        const { delivery_person_id } = req.body;
        const result = await OrderService.assignDelivery(req.params.id, delivery_person_id, req.userId, req.userRole);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

exports.getOrderTrack = async (req, res, next) => {
    try {
        const order = await OrderService.getOrderTrack(req.params.id, req.userId);
        res.json(order);
    } catch (err) {
        next(err);
    }
};

exports.getOrderDetails = async (req, res, next) => {
    try {
        const order = await OrderService.getOrderDetails(req.params.id, req.userId, req.userRole);
        res.json(order);
    } catch (err) {
        next(err);
    }
};

exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await OrderService.getAllOrders();
        return res.json(orders || []);
    } catch (err) {
        next(err);
    }
};