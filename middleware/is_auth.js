const jwt = require("jsonwebtoken");
const User = require("../Model/User");

module.exports = async (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not Authenticated");
    error.status = 401;
    return next(error);
  }
  const token = authHeader.split(" ")[1];

  if (!token || token === "null") {
    const error = new Error("Not Authenticated");
    error.status = 401;
    return next(error);
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "kerwani123");
  } catch (error) {
    error.message = "Invalid token";
    error.status = 400;
    return next(error);
  }
  if (!decodedToken) {
    const error = new Error("Not Authenticated");
    error.status = 401;
    return next(error);
  }
  User.findById(decodedToken.userId)
    .then((user) => {
      if (!user) {
        const error = new Error("User Not Found");
        error.status = 404;
        throw error;
      }
      req.userId = decodedToken.userId;
      next();
    })
    .catch((err) => {
      next(err);
    });
};
