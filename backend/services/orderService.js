const ProductModel = require("../models/productModel");
const OrderModel = require("../models/orderModel");

const OrderService = {
    async placeBulkOrder({ items, buyer_id }) {
        if (!buyer_id) {
            throw { status: 401, message: "Unauthorized" };
        }
        if (!Array.isArray(items) || items.length === 0) {
            throw { status: 400, message: "No items provided for order" };
        }

        const results = [];
        
        // 1. Validate all items first (Transactional behavior)
        for (const item of items) {
            const product = await ProductModel.findById(item.product_id);
            if (!product) throw { status: 404, message: `Product ${item.product_id} not found` };
            if (product.quantity < item.quantity) {
                 throw { status: 400, message: `Insufficient stock for ${product.name}. requested: ${item.quantity}, available: ${product.quantity}` };
            }
            item.product = product; // Attach product for later use
        }

        // 2. Create orders and decrement stock
        for (const item of items) {
            const { product_id, quantity, product } = item;
            const total_price = parseFloat(product.price) * quantity;
            
            const orderId = await OrderModel.create({
                product_id,
                buyer_id,
                seller_id: product.seller_id,
                quantity,
                total_price
            });

            await ProductModel.decrementQuantity(product_id, quantity);
            results.push({ orderId, product_id });
        }

        return { message: "All orders placed successfully", orders: results };
    },


    async getMyOrders(buyer_id) {
        if (!buyer_id) {
            throw { status: 401, message: "Unauthorized" };
        }
        const orders = await OrderModel.getByBuyer(buyer_id);
        return Array.isArray(orders) ? orders : [];
    },

    async getSellerOrders(seller_id) {
        return OrderModel.getBySeller(seller_id);
    },

    async updateOrderStatus(orderId, status, userId, role) {
        const allowed = ["Pending", "Accepted", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
        if (!allowed.includes(status)) {
            throw { status: 400, message: "Invalid status value" };
        }
        
        const order = await OrderModel.findById(orderId);
        if (!order) throw { status: 404, message: "Order not found" };

        const isSeller = order.seller_id === userId;
        const isDelivery = order.delivery_person_id === userId;
        if (!isSeller && !isDelivery && role !== "admin") {
            throw { status: 403, message: "Forbidden: You cannot update this order" };
        }

        // Delivery restriction: can only set fulfillment statuses
        if (isDelivery && !["Shipped", "Out for Delivery", "Delivered"].includes(status)) {
            throw { status: 400, message: "Delivery partners can only update delivery status" };
        }

        await OrderModel.updateStatus(orderId, status);
        return { message: "Order status updated" };
    },

    async assignDelivery(orderId, deliveryPersonId, userId, role) {
        const order = await OrderModel.findById(orderId);
        if (!order) throw { status: 404, message: "Order not found" };
        if (order.seller_id !== userId && role !== "admin") throw { status: 403, message: "Unauthorized to assign delivery" };

        await OrderModel.assignDelivery(orderId, deliveryPersonId);
        return { message: "Delivery partner assigned" };
    },

    async getDeliveryOrders(deliveryPersonId) {
        return OrderModel.getByDeliveryPerson(deliveryPersonId);
    },

    async getOrderTrack(orderId, userId) {
        const order = await OrderModel.findById(orderId);
        if (!order) throw { status: 404, message: "Order not found" };
        if (order.buyer_id !== userId && order.seller_id !== userId && order.delivery_person_id !== userId) {
            throw { status: 403, message: "Unauthorized access" };
        }
        return order;
    },

    async getOrderDetails(orderId, userId, userRole) {
        const order = await OrderModel.findById(orderId);
        if (!order) throw { status: 404, message: "Order not found" };

        // Admin can see everything
        if (userRole === 'admin') return order;

        // Seller, Buyer, or Delivery Partner must be related to the order
        if (order.buyer_id === userId || order.seller_id === userId || order.delivery_person_id === userId) {
            return order;
        }

        throw { status: 403, message: "You do not have permission to view this order" };
    },

    async getAllOrders() {
        return OrderModel.getAll();
    }

};

module.exports = OrderService;
