const fs = require("fs/promises");
const path = require("path");

exports.writeFile = async function (filepath, data) {
  const dataInString = JSON.stringify(data);
  const response = await fs.writeFile(filepath, dataInString);
  return response;
};
exports.readFile = async function (filepath) {
  let data = await fs.readFile(filepath);
  data = JSON.parse(data);
  return data;
};