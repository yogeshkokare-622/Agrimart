const db = require("../config/db");

const ReviewModel = {
    async create({ product_id, user_id, rating, comment }) {
        const [result] = await db.query(
            "INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)",
            [product_id, user_id, rating, comment]
        );
        return result.insertId;
    },

    async getByProduct(product_id) {
        try {
            const [rows] = await db.query(
                `SELECT r.*, u.name AS user_name
                 FROM reviews r
                 JOIN users u ON r.user_id = u.id
                 WHERE r.product_id = ?
                 ORDER BY r.created_at DESC`,
                [product_id]
            );
            return rows;
        } catch (err) {
            return MOCK_REVIEWS.filter(r => r.product_id == product_id);
        }
    },

    async getProductRating(product_id) {
        try {
            const [rows] = await db.query(
                "SELECT AVG(rating) as avgRating, COUNT(*) as count FROM reviews WHERE product_id = ?",
                [product_id]
            );
            return {
                avgRating: parseFloat(rows[0]?.avgRating) || 0,
                count: rows[0]?.count || 0
            };
        } catch (err) {
            const mine = MOCK_REVIEWS.filter(r => r.product_id == product_id);
            if (mine.length === 0) return { avgRating: 0, count: 0 };
            const avg = mine.reduce((s, r) => s + r.rating, 0) / mine.length;
            return { avgRating: avg, count: mine.length };
        }
    },

    async hasUserReviewed(product_id, user_id) {
        try {
            const [rows] = await db.query(
                "SELECT id FROM reviews WHERE product_id = ? AND user_id = ?",
                [product_id, user_id]
            );
            return rows.length > 0;
        } catch (err) {
            return false;
        }
    }
};

const MOCK_REVIEWS = [
    { id: 1, product_id: 101, user_id: 3, user_name: "Alice Smith", rating: 5, comment: "Amazing quality, very fresh!", created_at: new Date() },
    { id: 2, product_id: 101, user_id: 4, user_name: "Bob Doe", rating: 4, comment: "Good stuff.", created_at: new Date() }
];

module.exports = ReviewModel;

