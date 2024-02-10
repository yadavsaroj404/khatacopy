const express = require("express");
const bodyParser = require("body-parser");
const config = require('dotenv').config()

const userRoutes = require("./routes/user");
const expensesRoutes = require("./routes/expenses");

const path = require("path")
const data1 = require(path.join(process.cwd(), "tmp", "Users.json"));
const data2 = require(path.join(process.cwd(), "tmp", "Labels.json"));
const data3 = require(path.join(process.cwd(), "tmp", "Expenses.json"));
console.log(typeof(data1), typeof(data2), typeof(data3));

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, DELETE, PUT, PATCH"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(bodyParser.json());


app.use(userRoutes);
app.use(expensesRoutes);


app.get("/", (req, res)=>{
  res.status(200).json({message: `Hello from the server12`})
})


app.use((req, res)=>{
  res.status(404).json({message: "Requested URL not found on the server"});
})

app.use((err, req, res, next) => {
  const message = err.message || "Some Sever Error Occured";
  const statusCode = err.status || 500;
  const data = err.data || [];
  res.status(statusCode).json({ message, data });
});  

module.exports = app;