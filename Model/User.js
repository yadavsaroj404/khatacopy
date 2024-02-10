const path = require("path");
const fs = require("fs/promises")

const Labels = require("./Labels");
const { readFile, writeFile } = require("./helper/readWrite");

const filepath = path.join(process.cwd(), "tmp", "Users.json");

class User {
  constructor({ name, email, password }) {
    this._id = `u${new Date().getTime()}${Math.floor(
      Math.random() * 10 ** 10
    )}`;
    this.name = name;
    this.password = password;
    this.email = email;
    this.labels = [];
  }

  async save() {
    const users = await readFile(filepath);
    users.push(this);
    await writeFile(filepath, users);
    return this;
  }

  static async update(user) {
    try {
      const oldUserData = await readFile(filepath);
      const userIndex = oldUserData.findIndex(
        (usr) => usr._id === user._id
      );
      oldUserData[userIndex] = user;

      await writeFile(filepath, oldUserData);
      return user;
    } catch (error) {
      throw new Error("Failed to Update the label");
    }
  }

  static async findById(id = "") {
    try {
      const users = await readFile(filepath);
      const user = users.find((exp) => exp._id === "" + id);
      if (!user) {
        return null;
      }
      return user;
    } catch (error) {
      throw new Error("Failed to fetch the user");
    }
  }

  static async findByIdAndDelete(id = "") {
    try {
      const userToDelete = await User.findById(id);

      const oldUsersData = await readFile(filepath);
      const updatedUsersData = oldUsersData.filter(
        (user) => user._id !== userToDelete._id
      );
      await writeFile(filepath, updatedUsersData);
      return userToDelete;
    } catch (error) {
      throw new Error("Failed to delete the user");
    }
  }

  static async findOne(option = {}) {
    try {
      const users = await readFile(filepath);
      if(users.length === 0){
        return null;
      }
      for (let i = 0; i < users.length; i++) {
        for (let key in option) {
          if (users[i][key] === option[key]) {
            return users[i];
          }
        }
      }
      return null;
    } catch (error) {
      throw new Error(error);
    }
  }

  static async findByIdAndPopulate(id = "") {
    try {
      const user = await User.findById(id);
      const userLabels = await Labels.findManyById(user.labels);
      user.labels = userLabels;
      return user;
    } catch (error) {
      throw new Error("Failed to find or populate user");
    }
  }
}

module.exports = User;
