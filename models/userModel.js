const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    premiumUser: { type: Boolean, required: true },
    expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Expense" }],
    totalExpenses: { type: Number, required: true },
    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
  },
  { timestamps: true }
);

userSchema.methods.addExpense = function (expense) {
  this.expenses.push(expense._id);
  this.totalExpenses += expense.amount;
  return this.save();
};

userSchema.methods.editExpense = function (expense, amount) {
  this.totalExpenses = this.totalExpenses - expense.amount + parseFloat(amount);
  return this.save();
};

userSchema.methods.deleteExpense = function (expense) {
  const userExpenseId = this.expenses.findIndex(
    (e) => e.toString() === expense._id.toString()
  );
  if (userExpenseId >= 0) {
    this.expenses = this.expenses.filter(
      (e) => e.toString() !== expense._id.toString()
    );
    this.totalExpenses -= expense.amount;
    return this.save();
  } else {
    throw new Error("No expense found with this id");
  }
};

userSchema.methods.addPayment = function (payment) {
  this.payments.push(payment._id);
  return this.save();
};

const User = mongoose.model("User", userSchema);

module.exports = User;
