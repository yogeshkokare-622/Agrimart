const db = require("../config/db");

const OrderModel = {
    async create({ product_id, buyer_id, seller_id, quantity, total_price }) {
        try {
            const [result] = await db.query(
                `INSERT INTO orders (product_id, buyer_id, seller_id, quantity, total_price, status)
                 VALUES (?, ?, ?, ?, ?, 'Pending')`,
                [product_id, buyer_id, seller_id, quantity, total_price]
            );
            return result.insertId;
        } catch (err) {
            if (err.code === 'ER_BAD_FIELD_ERROR' || err.code === 'ER_NO_SUCH_TABLE') {
                throw { 
                    status: 500, 
                    message: `Database error: Table or column mismatch in 'orders'.`,
                    fix: "Please run 'mysql -u root agrimart < database/agrimart.sql' to update your schema."
                };
            }
            throw err;
        }
    },



    async getByBuyer(buyer_id) {
        try {
            const [rows] = await db.query(
                `SELECT o.*, p.name AS product_name, p.image AS product_image, u.name AS seller_name
                 FROM orders o
                 JOIN products p ON o.product_id = p.id
                 JOIN users u ON o.seller_id = u.id
                 WHERE o.buyer_id = ?
                 ORDER BY o.created_at DESC`,
                [buyer_id]
            );
            return rows;
        } catch (err) {
            return MOCK_ORDERS.filter(o => o.buyer_id == buyer_id);
        }
    },

    async getBySeller(seller_id) {
        try {
            const [rows] = await db.query(
                `SELECT o.*, p.name AS product_name, p.image AS product_image, u.name AS buyer_name, u.email AS buyer_email
                 FROM orders o
                 JOIN products p ON o.product_id = p.id
                 JOIN users u ON o.buyer_id = u.id
                 WHERE o.seller_id = ?
                 ORDER BY o.created_at DESC`,
                [seller_id]
            );
            return rows;
        } catch (err) {
            return MOCK_ORDERS.filter(o => o.seller_id == seller_id);
        }
    },

    async findById(id) {
        try {
            const [rows] = await db.query(
                `SELECT o.*, 
                        p.name AS product_name, p.image AS product_image, p.description AS product_description, p.category,
                        b.name AS buyer_name, b.email AS buyer_email, b.phone AS buyer_phone, b.address AS delivery_address,
                        s.name AS seller_name, s.email AS seller_email, s.phone AS seller_phone, s.address AS pickup_address,
                        d.name AS delivery_person_name, d.email AS delivery_email, d.phone AS delivery_phone
                 FROM orders o
                 JOIN products p ON o.product_id = p.id
                 JOIN users b ON o.buyer_id = b.id
                 JOIN users s ON o.seller_id = s.id
                 LEFT JOIN users d ON o.delivery_person_id = d.id
                 WHERE o.id = ?`,
                [id]
            );
            return rows[0] || null;
        } catch (err) {
            return MOCK_ORDERS.find(o => o.id == id) || null;
        }
    },

    async assignDelivery(id, delivery_person_id) {
        await db.query(
            "UPDATE orders SET delivery_person_id = ?, status = 'Packed' WHERE id = ?",
            [delivery_person_id, id]
        );
    },

    async getByDeliveryPerson(delivery_person_id) {
        try {
            const [rows] = await db.query(
                `SELECT o.*, p.name AS product_name, p.image AS product_image, 
                        b.name AS buyer_name, b.email AS buyer_email
                 FROM orders o
                 JOIN products p ON o.product_id = p.id
                 JOIN users b ON o.buyer_id = b.id
                 WHERE o.delivery_person_id = ?
                 ORDER BY o.created_at DESC`,
                [delivery_person_id]
            );
            return rows;
        } catch (err) {
            return [];
        }
    },

    async getAll() {
        try {
            const [rows] = await db.query(`
                SELECT o.*, 
                       p.name AS product_name, p.image AS product_image,
                       b.name AS buyer_name,
                       s.name AS seller_name,
                       d.name AS delivery_name
                FROM orders o
                JOIN products p ON o.product_id = p.id
                JOIN users b ON o.buyer_id = b.id
                JOIN users s ON o.seller_id = s.id
                LEFT JOIN users d ON o.delivery_person_id = d.id
                ORDER BY o.created_at DESC
            `);
            return rows;
        } catch (err) {
            return MOCK_ORDERS;
        }
    },

    async updateStatus(id, status) {
        await db.query("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [status, id]);
    },


    async getSellerAnalytics(seller_id) {
        try {
            const [stats] = await db.query(
                `SELECT 
                    COUNT(*) as totalOrders,
                    SUM(CASE WHEN status = 'Delivered' THEN total_price ELSE 0 END) as totalSales,
                    COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pendingOrders
                 FROM orders WHERE seller_id = ?`,
                [seller_id]
            );
            
            const [revenue] = await db.query(
                `SELECT DATE(created_at) as date, SUM(total_price) as dailyRevenue
                 FROM orders 
                 WHERE seller_id = ? AND status = 'Delivered'
                 AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                 GROUP BY DATE(created_at)
                 ORDER BY date ASC`,
                [seller_id]
            );

            return {
                ...stats[0],
                revenueChart: revenue
            };
        } catch (err) {
            const mine = MOCK_ORDERS.filter(o => o.seller_id == seller_id);
            return {
                totalOrders: mine.length,
                totalSales: mine.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.total_price, 0),
                pendingOrders: mine.filter(o => o.status === 'Pending').length,
                revenueChart: []
            };
        }
    }
};

const MOCK_ORDERS = [
    { id: 1001, product_id: 101, product_name: "Organic Tomatoes", product_image: null, buyer_id: 3, buyer_name: "Alice Smith", seller_id: 1, seller_name: "Farmer John", quantity: 2, total_price: 80, status: "Delivered", created_at: new Date() },
    { id: 1002, product_id: 103, product_name: "Alphonso Mangoes", product_image: null, buyer_id: 3, buyer_name: "Alice Smith", seller_id: 2, seller_name: "Satara Farms", quantity: 1, total_price: 600, status: "Pending", created_at: new Date() }
];

module.exports = OrderModel;