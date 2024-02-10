const { validationResult } = require("express-validator");

const Expenses = require("../Model/Expenses");
const Label = require("../Model/Labels");

exports.getExpenses = async (req, res, next) => {
  const labelId = req.params.labelId;
  try {
    const label = await Label.findByIdAndPopulate(labelId);
    res.status(200).json({
      label: { name: label.name, budget: label.budget, id: label._id },
      expenses: label.expenses,
    });
  } catch (error) {
    error.message = "Invalid label Id";
    error.status = 400;
    return next(error);
  }
};

exports.addExpense = async (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    const error = new Error("Validation Error");
    error.status = 422;
    error.data = validationErrors.array().map((err) => err.msg);
    return next(error);
  }
  const name = req.body.name;
  const amount = req.body.amount;
  const date = req.body.date || new Date().toISOString();

  // creating new expense object
  const expense = new Expenses({
    name: name,
    amount: amount,
    label: req.label._id,
    date: date,
  });
  try {
    const uploadedExpense = await expense.save();
    // adding this expense to its label
    req.label.expenses.push(uploadedExpense._id);
    req.label.totalExpense += +uploadedExpense.amount;
    await Label.update(req.label);
    res
      .status(201)
      .json({ message: "Expense added", expense: uploadedExpense });
  } catch (error) {
    return next(error);
  }
};

exports.addMultipleExpenses = async (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    const error = new Error("Validation Error");
    error.status = 422;
    error.data = validationErrors.array().map((err) => err.msg);
    return next(error);
  }

  const expenses = req.body.multipleExpenses;
  const createdAt = req.body.date || new Date().toISOString();

  // const splitedExpenses = expenses.split(",").map((item) => {
  //   const [name, amount] = item.replace(")", "").split("(");
  //   return new Expenses({ name, amount, date: createdAt });
  // });
  const formattedExpenses = [];
  const splitedExpenses = expenses.split(",");
  for(let i=0; i<splitedExpenses.length; i++){
    const item = splitedExpenses[i];
    const [name, amount] = item.replace(")", "").split("(");
    const expenseObj = new Expenses({name, amount, date: createdAt});
    const expense = await expenseObj.save()

    
    req.label.expenses.push(expenseObj._id);
    req.label.totalExpense += +expenseObj.amount;
    await Label.update(req.label);

    formattedExpenses.push(expense)
  }
  
  res.status(200).json({formattedExpenses})
};

exports.deleteExpense = async (req, res, next) => {
  const expenseId = req.body.id;
  try {
    // delete expense from expenses collection
    const expense = await Expenses.findByIdAndDelete(expenseId);

    // remove expense from its label
    req.label.expenses = req.label.expenses.filter(
      (expense) => expense.toString() !== expenseId.toString()
    );
    req.label.totalExpense -= +expense.amount;
    await Label.update(req.label);

    res.status(200).json({
      message: "expense deleted successfully",
      deletedExpense: expense,
    });
  } catch (error) {
    error.message = "Invalid Expense Id";
    error.status = 400;
    return next(error);
  }
};
