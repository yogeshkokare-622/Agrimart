const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");
const { verifyToken, requireSellerOrAdmin } = require("../middlewares/authMiddleware");

router.use(verifyToken);
router.use(requireSellerOrAdmin);

router.get("/", expenseController.getExpenses);
router.post("/", expenseController.addExpense);
router.delete("/:id", expenseController.deleteExpense);
router.get("/summary", expenseController.getProfitSummary);

module.exports = router;
