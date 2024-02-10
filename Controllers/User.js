const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const User = require("../Model/User");
const Expenses = require("../Model/Expenses");
const Labels = require("../Model/Labels");

exports.login = async (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    const error = new Error("Invalid credientials");
    error.status = 422;
    error.data = validationErrors.array().map((err) => err.msg);
    return next(error);
  }

  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("Incorrect email");
      error.status = 404;
      return next(error);
    }
    const isPasswordSame = await bcrypt.compare(password, user.password);

    if (!isPasswordSame) {
      const error = new Error("Incorrect password");
      error.status = 401;
      return next(error);
    }
    const token = jwt.sign(
      { email: user.email, userId: user._id },
      "kerwani123",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login Successfull",
      token,
      email: user.email,
      username: user.name,
      userId: user._id,
    });
  } catch (error) {
    return next(error);
  }
};

exports.signUp = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(422).json({
      message: "Validation Error",
      data: error.array().map((error) => error.msg),
    });
  }
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  try {
    const hashedPw = await bcrypt.hash(password, 12);
    
    const user = new User({
      name: name,
      email: email,
      password: hashedPw,
      labels: [],
    });

    const responseUser = await user.save();
    return res.status(201).json({
      message: "User created successfully",
      user: {
        name: responseUser.name,
        email: responseUser.email,
        id: responseUser._id,
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.deleteAccount = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    const error = new Error("Incorrect password");
    error.status = 422;
    return next(error);
  }
  try {
    const user = await User.findByIdAndPopulate(req.userId);
    const password = req.body.password;
    const isPasswordSame = await bcrypt.compare(password, user.password);

    if (!isPasswordSame) {
      const error = new Error("Incorrect password");
      error.status = 401;
      return next(error);
    }
    const userLabels = user.labels;
    const userLabelsId = userLabels.map((label) => label._id);
    const userExpensesId = [];
    userLabels.map((label) => userExpensesId.push(...label.expenses));

    // delete all expenses related to label made by user
    await Expenses.deleteManyById(userExpensesId);

    // delete all labels made by user
    await Labels.deleteManyById(userLabelsId);

    // delete user
    const deletedUser = await User.findByIdAndDelete(req.userId);
    res.status(200).json({ msg: "Account Deleted" });
  } catch (error) {
    next(error);
  }
};

exports.getDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    res.status(200).json({ name: user.name, email: user.email });
  } catch (error) {
    next(error);
  }
};
