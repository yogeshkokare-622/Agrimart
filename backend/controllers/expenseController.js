const ExpenseModel = require("../models/expenseModel");

exports.addExpense = async (req, res, next) => {
    try {
        const { title, amount, category } = req.body;
        const seller_id = req.userId;
        const id = await ExpenseModel.create({ seller_id, title, amount, category });
        res.status(201).json({ id, title, amount, category });
    } catch (err) {
        next(err);
    }
};

exports.getExpenses = async (req, res, next) => {
    try {
        const expenses = await ExpenseModel.getBySeller(req.userId);
        res.json(expenses);
    } catch (err) {
        next(err);
    }
};

exports.deleteExpense = async (req, res, next) => {
    try {
        await ExpenseModel.delete(req.params.id, req.userId);
        res.json({ message: "Expense deleted" });
    } catch (err) {
        next(err);
    }
};

exports.getProfitSummary = async (req, res, next) => {
    try {
        const stats = await ExpenseModel.getSellerStats(req.userId);
        res.json(stats);
    } catch (err) {
        next(err);
    }
};
