const OrderService = require("../services/orderService");
const UserModel  = require("../models/userModel");
const OrderModel = require("../models/orderModel");
const db         = require("../config/db");

// ── USER MANAGEMENT ──────────────────────────────────────────

exports.getAllUsers = async (req, res, next) => {
    try {
        const [users] = await db.query(
            "SELECT id, name, email, role, phone, address, is_blocked AS isBlocked, is_approved AS isApproved, created_at FROM users ORDER BY created_at DESC"
        );
        res.json(users);
    } catch (err) {
        next(err);
    }
};

exports.toggleUserBlock = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [[user]] = await db.query("SELECT is_blocked, role FROM users WHERE id = ?", [id]);
        
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.role === 'admin') return res.status(403).json({ message: "Cannot block an admin" });

        const newStatus = user.is_blocked ? 0 : 1;
        await db.query("UPDATE users SET is_blocked = ? WHERE id = ?", [newStatus, id]);
        
        res.json({ message: `User ${newStatus ? 'blocked' : 'unblocked'} successfully`, is_blocked: newStatus });
    } catch (err) {
        next(err);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [[user]] = await db.query("SELECT role FROM users WHERE id = ?", [id]);
        if (user?.role === 'admin') return res.status(403).json({ message: "Cannot delete admin" });

        await db.query("DELETE FROM users WHERE id = ?", [id]);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        next(err);
    }
};

// ── SELLER MANAGEMENT ────────────────────────────────────────

exports.getAllSellers = async (req, res, next) => {
    try {
        const [sellers] = await db.query(
            "SELECT id, name, email, phone, is_approved AS isApproved, is_blocked AS isBlocked, created_at FROM users WHERE role = 'seller' ORDER BY created_at DESC"
        );
        res.json(sellers);
    } catch (err) {
        next(err);
    }
};

exports.approveSeller = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.query("UPDATE users SET is_approved = 1, role = 'seller' WHERE id = ?", [id]);
        res.json({ message: "Seller approved successfully" });
    } catch (err) {
        next(err);
    }
};

exports.rejectSeller = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Rejection could mean deleting or just setting is_approved to 0. 
        // We'll set to 0 and maybe send a notification (if implemented).
        await db.query("UPDATE users SET is_approved = 0 WHERE id = ? AND role = 'seller'", [id]);
        res.json({ message: "Seller rejected" });
    } catch (err) {
        next(err);
    }
};

// ── ORDER MANAGEMENT ─────────────────────────────────────────

exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await OrderModel.getAll();
        res.json(orders);
    } catch (err) {
        next(err);
    }
};

exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const allowed = ["Pending", "Accepted", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        await OrderModel.updateStatus(req.params.id, status);
        res.json({ message: `Order status updated to ${status}` });
    } catch (err) {
        next(err);
    }
};

// ── DASHBOARD STATS ──────────────────────────────────────────

exports.getDashboardStats = async (req, res, next) => {
    try {
        const [[{ userCount }]]       = await db.query("SELECT COUNT(*) AS userCount FROM users");
        const [[{ orderCount }]]      = await db.query("SELECT COUNT(*) AS orderCount FROM orders");
        const [[{ productCount }]]    = await db.query("SELECT COUNT(*) AS productCount FROM products");
        const [[{ sellerCount }]]     = await db.query("SELECT COUNT(*) AS sellerCount FROM users WHERE role = 'seller' AND is_approved = 1");
        const [[{ deliveryCount }]]   = await db.query("SELECT COUNT(*) AS deliveryCount FROM users WHERE role = 'delivery'");
        const [[{ revenue }]]         = await db.query("SELECT IFNULL(SUM(total_price), 0) AS revenue FROM orders WHERE status = 'Delivered'");
        const [[{ pendingOrders }]]   = await db.query("SELECT COUNT(*) AS pendingOrders FROM orders WHERE status = 'Pending'");

        res.json({ 
            userCount, 
            orderCount, 
            productCount, 
            sellerCount, 
            deliveryCount,
            revenue,
            pendingOrders
        });
    } catch (err) {
        next(err);
    }
};

// ── DELIVERY MANAGEMENT ──────────────────────────────────────

exports.assignDeliveryPerson = async (req, res, next) => {
    try {
        const { orderId, deliveryPersonId } = req.body;
        if (!orderId || !deliveryPersonId) {
            return res.status(400).json({ message: "Order ID and Delivery Person ID are required" });
        }
        
        await OrderService.assignDelivery(orderId, deliveryPersonId, req.userId, req.userRole);
        res.json({ message: "Delivery person assigned successfully" });
    } catch (err) {
        next(err);
    }
};
