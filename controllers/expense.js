const Expense = require("../models/expense");
const { getExpenses } = require("../services/user");

const getAllExpenses = async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize) || 5;
    const currentPage = parseInt(req.query.page) || 1;
    const totalRecords = await req.user.expenses.length;
    const lastPage = Math.ceil(totalRecords / pageSize);
    const skip = (currentPage - 1) * pageSize;
    await getExpenses(req);
    const expenses = req.user.expenses.slice(skip, skip + pageSize);
    if (!expenses) {
      return res.status(500).json({
        status: false,
        data: null,
        message:
          "Something went wring while fetching expenses, pleas try again",
      });
    }
    return res.status(200).json({
      status: true,
      data: { currentPage, lastPage, data: expenses, totalRecords },
      message: "List of all expenses",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: error.message,
    });
  }
};

const addExpense = async (req, res) => {
  try {
    const { amount, category, description } = req.body;
    if (!amount || !category || !description) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing required fields",
      });
    }
    const expense = await Expense.create({
      amount: parseFloat(amount),
      category,
      description,
      userId: req.user._id,
    });
    if (!expense) {
      return res.status(500).json({
        status: false,
        data: null,
        message: "Something went wring while adding expense, pleas try again",
      });
    }
    const updatedUser = await req.user.addExpense(expense);
    if (!updatedUser) {
      throw new Error(
        "Something went wrong while adding epense, please try again"
      );
    }
    return res.status(201).json({
      status: true,
      data: expense,
      message: "Successfully added expense",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: error.message,
    });
  }
};

const editExpense = async (req, res) => {
  try {
    const id = req.params.expenseId;
    if (!id) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing expense id",
      });
    }
    const { amount, category, description } = req.body;
    if (!amount || !category || !description) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing required fields",
      });
    }
    const expense = await Expense.findById(id);
    if (expense) {
      const updatedExpense = await Expense.findByIdAndUpdate(
        id,
        {
          amount,
          category,
          description,
          userId: req.user._id,
        },
        { new: true }
      );
      if (!updatedExpense) {
        throw new Error(
          "Something went wrong while updating expense, please try again"
        );
      }
      const updatedUser = await req.user.editExpense(expense, parseInt(amount));
      if (!updatedUser) {
        throw new Error(
          "Something went wrong while updating expense, please try again"
        );
      }
      return res.status(201).json({
        status: true,
        data: null,
        message: "Edited expense successfully",
      });
    } else {
      return res
        .status(404)
        .json({ status: false, data: null, message: "Expense not found" });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: error.message,
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const id = req.params.expenseId;
    if (!id) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Missing expense id",
      });
    }
    const expense = await Expense.findById(id);
    if (expense) {
      const deletedExpense = await Expense.findByIdAndDelete(id);
      if (!deletedExpense) {
        return res.status(400).json({
          status: false,
          data: null,
          message: "Expense not found",
        });
      }
      const updatedUser = await req.user.deleteExpense(expense);
      if (!updatedUser) {
        throw new Error(
          "Something went wrong while deleting expense, please try again"
        );
      }
      return res.status(200).json({
        status: true,
        data: null,
        message: "Expense deleted successfully",
      });
    } else {
      return res
        .status(404)
        .json({ status: false, data: null, message: "Expense not found" });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: error.message,
    });
  }
};

module.exports = { getAllExpenses, addExpense, editExpense, deleteExpense };
