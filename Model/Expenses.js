const path = require("path");

const { readFile, writeFile } = require("./helper/readWrite");

const filepath = path.join("tmp", "Expenses.json");

class Expenses {
  constructor({ name, amount, date = new Date().toISOString(), label }) {
    this._id = `e${new Date().getTime()}${Math.floor(
      Math.random() * 10 ** 10
    )}`;
    this.name = name;
    this.amount = amount;
    this.label = label;
    this.createdAt = new Date(date).toISOString();
  }
  async save() {
    try {
      const oldExpensesData = await readFile(filepath);
      oldExpensesData.push(this);
      const sortedExpensesData = oldExpensesData.sort((a,b)=>{
        const aDate = new Date(a.createdAt).getTime();
        const bDate = new Date(b.createdAt).getTime();
        return +aDate - +bDate;
      })
      await writeFile(filepath, sortedExpensesData);
      return this;
    } catch (error) {
      throw new Error("Failed to save the expense");
    }
  }

  static async findById(id) {
    try {
      const expenses = await readFile(filepath);
      const expense = expenses.find((exp) => exp._id === "" + id);
      if (!expense) {
        return {};
      }
      return expense;
    } catch (error) {
      throw new Error("Failed to fetch the expense");
    }
  }

  static async findByIdAndDelete(id = "") {
    try {
      const expenseToDelete = await Expenses.findById(id);

      const oldExpensesData = await readFile(filepath);
      const updatedExpensesData = oldExpensesData.filter(
        (expense) => expense._id !== expenseToDelete._id
      );
      await writeFile(filepath, updatedExpensesData);
      return expenseToDelete;
    } catch (error) {
      throw new Error("Failed to delete the expense");
    }
  }

  static async update(expense) {
    try {
      const oldExpensesData = await readFile(filepath);
      const expenseIndex = oldExpensesData.findIndex(
        (exp) => exp._id === expense._id
      );
      oldExpensesData[expenseIndex] = expense;

      await writeFile(filepath, oldExpensesData);
      return expense;
    } catch (error) {
      throw new Error("Failed to Update the expense");
    }
  }

  static async findOne(option = {}) {
    try {
      const expenses = await readFile(filepath);
      for (let i = 0; i < expenses.length; i++) {
        for (let key in option) {
          if (expenses[i][key] === option[key]) {
            return expenses[i];
          }
        }
      }
      return null;
    } catch (error) {
      throw new Error("Failed to fetch the expense");
    }
  }

  static async find(option) {
    try {
      const expenses = await readFile(filepath);
      if (!option) {
        return expenses;
      }
      const filteredExpenses = expenses.filter((expense) => {
        for (let key in option) {
          return expense[key] === option[key];
        }
      });
      return filteredExpenses;
    } catch (error) {
      throw new Error("Failed to fetch all expenses");
    }
  }

  static async findManyById(idArr = []) {
    const allExpenses = await Expenses.find();
    const populatedExpenses = allExpenses.filter((expense) => {
      return idArr.some((id) => id === expense._id);
    });
    return populatedExpenses;
  }

  static async deleteOne(option = {}) {
    try {
      const expense = await Expenses.findOne(option);
      if (!expense) {
        return {};
      }
      const deletedExpense = await Expenses.findByIdAndDelete(expense?._id);
      return deletedExpense;
    } catch (error) {
      throw new Error("Failed to delete that expense");
    }
  }

  static async deleteMany(option = {}) {
    try {
      const expensesToBeDeleted = await Expenses.find(option);
      const allExpenses = await readFile(filepath);
      const remainingExpenses = allExpenses.filter(
        (allExpenseItem) =>
          !expensesToBeDeleted.some(
            (expenseItemToBeDeleted) =>
              expenseItemToBeDeleted._id === allExpenseItem._id
          )
      );
      await writeFile(filepath, remainingExpenses);
      return expensesToBeDeleted;
    } catch (error) {
      throw new Error("Failed to delete expenses");
    }
  }

  static async deleteManyById(idArr = []) {
    const allExpenses = await Expenses.find();
    const remainingExpenses = allExpenses.filter((expense) => {
      return !idArr.some((id) => id === expense._id);
    });
    await writeFile(filepath, remainingExpenses);
    return remainingExpenses;
  }
}

module.exports = Expenses;
