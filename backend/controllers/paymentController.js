const PaymentService = require("../services/paymentService");

exports.createPayment = async (req, res, next) => {
    try {
        const { order_id, method, transaction_id } = req.body;
        const result = await PaymentService.createPayment({
            order_id,
            user_id: req.userId,
            method: method || "Online",
            transaction_id
        });
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
};

exports.getMyPayments = async (req, res, next) => {
    try {
        const payments = await PaymentService.getMyPayments(req.userId);
        res.json(payments);
    } catch (err) {
        next(err);
    }
};

exports.getPaymentByOrder = async (req, res, next) => {
    try {
        const payment = await PaymentService.getPaymentByOrder(req.params.orderId);
        res.json(payment);
    } catch (err) {
        next(err);
    }
};
