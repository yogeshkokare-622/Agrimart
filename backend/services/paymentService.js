const PaymentModel = require("../models/paymentModel");
const OrderModel   = require("../models/orderModel");

const PaymentService = {
    /**
     * Record a payment for a given order.
     * In a production setup, this would integrate with Razorpay/Stripe SDK
     * to verify the payment signature before recording.
     */
    async createPayment({ order_id, user_id, method, transaction_id }) {
        const order = await OrderModel.findById(order_id);
        if (!order) throw { status: 404, message: "Order not found" };
        if (order.buyer_id !== user_id) {
            throw { status: 403, message: "Forbidden: not your order" };
        }

        const existingPayment = await PaymentModel.findByOrderId(order_id);
        if (existingPayment && existingPayment.status === "Completed") {
            throw { status: 409, message: "Payment already completed for this order" };
        }

        const amount = parseFloat(order.total_price);

        // In production: verify payment with Razorpay/Stripe here
        // For now, mark as completed on COD or simulated payment
        const status = method === "COD" ? "Completed" : "Completed";

        const paymentId = await PaymentModel.create({
            order_id,
            user_id,
            amount,
            method,
            transaction_id: transaction_id || `TXN_${Date.now()}`,
            status
        });

        // Update order status to Confirmed if payment successful
        if (status === "Completed") {
            await OrderModel.updateStatus(order_id, "Confirmed");
        }

        return { paymentId, message: "Payment recorded successfully", status };
    },

    async getMyPayments(user_id) {
        return PaymentModel.findByUser(user_id);
    },

    async getPaymentByOrder(order_id) {
        const payment = await PaymentModel.findByOrderId(order_id);
        if (!payment) throw { status: 404, message: "No payment found for this order" };
        return payment;
    }
};

module.exports = PaymentService;
