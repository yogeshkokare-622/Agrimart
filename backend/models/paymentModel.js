const db = require("../config/db");

const PaymentModel = {
    async create({ order_id, user_id, amount, method, transaction_id, status = "Pending" }) {
        const [result] = await db.query(
            `INSERT INTO payments (order_id, user_id, amount, method, transaction_id, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [order_id, user_id, amount, method, transaction_id || null, status]
        );
        return result.insertId;
    },

    async findByOrderId(order_id) {
        const [rows] = await db.query("SELECT * FROM payments WHERE order_id = ?", [order_id]);
        return rows[0] || null;
    },

    async findByUser(user_id) {
        const [rows] = await db.query(
            `SELECT p.*, o.quantity, o.status AS order_status,
                    pr.name AS product_name
             FROM payments p
             JOIN orders o   ON p.order_id = o.id
             JOIN products pr ON o.product_id = pr.id
             WHERE p.user_id = ?
             ORDER BY p.id DESC`,
            [user_id]
        );
        return rows;
    },

    async updateStatus(id, status, transaction_id) {
        await db.query(
            "UPDATE payments SET status = ?, transaction_id = ? WHERE id = ?",
            [status, transaction_id, id]
        );
    },

    async findById(id) {
        const [rows] = await db.query("SELECT * FROM payments WHERE id = ?", [id]);
        return rows[0] || null;
    }
};

module.exports = PaymentModel;
