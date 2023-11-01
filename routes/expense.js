const express = require("express");
const {
  addExpense,
  getAllExpenses,
  editExpense,
  deleteExpense,
} = require("../controllers/expense");
const { protect } = require("../middlewares/auth");
const router = express.Router();

router.post("/add-expense", protect, addExpense);

router.get("/expenses", protect, getAllExpenses);

router.post("/edit-expense/:expenseId", protect, editExpense);

router.delete("/delete-expense/:expenseId", protect, deleteExpense);

module.exports = router;
