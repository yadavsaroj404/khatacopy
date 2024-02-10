const path = require("path");

const Expenses = require("./Expenses");
const { readFile, writeFile } = require("./helper/readWrite");

const filepath = path.join(process.cwd(), "tmp", "Labels.json");

class Labels {
  constructor({ name, budget }) {
    this._id = `l${new Date().getTime()}${Math.floor(
      Math.random() * 10 ** 10
    )}`;
    this.name = name;
    this.budget = budget;
    this.totalExpense = 0;
    this.expenses = [];
  }
  async save() {
    try {
      const oldLabelsData = await readFile(filepath);
      oldLabelsData.push(this);

      await writeFile(filepath, oldLabelsData);
      return this;
    } catch (error) {
      throw new Error("Failed to save the Label");
    }
  }

  static async findById(id = "") {
    try {
      const labels = await readFile(filepath);
      const label = labels.find((exp) => exp._id === "" + id);
      if (!label) {
        return null;
      }
      return label;
    } catch (error) {
      throw new Error("Failed to fetch the label");
    }
  }

  static async findByIdAndDelete(id = "") {
    try {
      const labelToDelete = await Labels.findById(id);

      const oldLabelsData = await readFile(filepath);
      const updatedLabelsData = oldLabelsData.filter(
        (label) => label._id !== labelToDelete._id
      );
      await writeFile(filepath, updatedLabelsData);
      return labelToDelete;
    } catch (error) {
      throw new Error("Failed to delete the label");
    }
  }

  static async update(label) {
    try {
      const oldlabelsData = await readFile(filepath);
      const labelIndex = oldlabelsData.findIndex(
        (lbl) => lbl._id === label._id
      );
      oldlabelsData[labelIndex] = label;

      await writeFile(filepath, oldlabelsData);
      return label;
    } catch (error) {
      throw new Error("Failed to Update the label");
    }
  }

  static async findOne(option = {}) {
    try {
      const labels = await readFile(filepath);
      for (let i = 0; i < labels.length; i++) {
        for (let key in option) {
          if (labels[i][key] === option[key]) {
            return labels[i];
          }
        }
      }
      return null;
    } catch (error) {
      throw new Error("Failed to fetch the label");
    }
  }

  static async find(option) {
    try {
      const labels = await readFile(filepath);
      if (!option) {
        return labels;
      }
      const filteredLabels = labels.filter((label) => {
        for (let key in option) {
          return label[key] === option[key];
        }
      });
      return filteredLabels;
    } catch (error) {
      throw new Error("Failed to fetch all labels");
    }
  }

  static async deleteOne(option = {}) {
    try {
      const label = await Labels.findOne(option);
      if (!label) {
        return null;
      }
      const deletedLabel = await Labels.findByIdAndDelete(label?._id);
      return deletedLabel;
    } catch (error) {
      throw new Error("Failed to delete that label");
    }
  }

  static async deleteMany(option = {}) {
    try {
      const labelsToBeDeleted = await Labels.find(option);
      const allLabels = await readFile(filepath);
      const remainingLabels = allLabels.filter(
        (allLabelItem) =>
          !labelsToBeDeleted.some(
            (labelItemToBeDeleted) =>
              labelItemToBeDeleted._id === allLabelItem._id
          )
      );
      await writeFile(filepath, remainingLabels);
      return labelsToBeDeleted;
    } catch (error) {
      throw new Error("Failed to delete expenses");
    }
  }

  static async deleteManyById(idArr = []) {
    const allLabels = await Labels.find();
    const remainingLabels = allLabels.filter((label) => {
      return !idArr.some((id) => id === label._id);
    });
    await writeFile(filepath, remainingLabels);
    return remainingLabels;
  }

  static async findByIdAndPopulate(id = "") {
    try {
      const label = await Labels.findById(id);
      const labelsExpenses = await Expenses.findManyById(label.expenses);
      label.expenses = labelsExpenses;
      return label;
    } catch (error) {
      throw new Error("Failed to find or populate label");
    }
  }

  static async findManyById(idArr = []) {
    const allLabels = await Labels.find();
    const populatedLabels = allLabels.filter((label) => {
      return idArr.some((id) => id === label._id);
    });
    return populatedLabels;
  }
}

module.exports = Labels;
