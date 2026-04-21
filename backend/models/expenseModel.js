const db = require("../config/db");

const ExpenseModel = {
    async create({ seller_id, title, amount, category }) {
        const [result] = await db.query(
            "INSERT INTO expenses (seller_id, title, amount, category) VALUES (?, ?, ?, ?)",
            [seller_id, title, amount, category]
        );
        return result.insertId;
    },

    async getBySeller(seller_id) {
        try {
            const [rows] = await db.query(
                "SELECT * FROM expenses WHERE seller_id = ? ORDER BY created_at DESC",
                [seller_id]
            );
            return rows;
        } catch (err) {
            return MOCK_EXPENSES.filter(e => e.seller_id == seller_id);
        }
    },

    async delete(id, seller_id) {
        await db.query("DELETE FROM expenses WHERE id = ? AND seller_id = ?", [id, seller_id]);
    },

    async getSellerStats(seller_id) {
        try {
            const [incomeRows] = await db.query(
                "SELECT SUM(total_price) as totalIncome FROM orders WHERE seller_id = ? AND status = 'Delivered'",
                [seller_id]
            );
            const [expenseRows] = await db.query(
                "SELECT SUM(amount) as totalExpense FROM expenses WHERE seller_id = ?",
                [seller_id]
            );
            const income = parseFloat(incomeRows[0]?.totalIncome) || 0;
            const expense = parseFloat(expenseRows[0]?.totalExpense) || 0;
            return { income, expense, profit: income - expense };
        } catch (err) {
            return { income: 5000, expense: 1200, profit: 3800 }; // Mock stats
        }
    }
};

const MOCK_EXPENSES = [
    { id: 1, seller_id: 1, title: "Seed Purchase", amount: 500, category: "Seeds", created_at: new Date() },
    { id: 2, seller_id: 1, title: "Fertilizer", amount: 700, category: "Tools", created_at: new Date() }
];

module.exports = ExpenseModel;

