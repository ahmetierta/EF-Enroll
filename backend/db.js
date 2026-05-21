const mysql = require("mysql2");
const { database } = require("./config/env");

const db = mysql.createConnection({
  host: database.host,
  port: database.port,
  user: database.user,
  password: database.password,
  database: database.name,
});

db.connect((err) => {
  if (err) {
    console.log("Gabim ne lidhje me databaze:", err);
  } else {
    console.log("Database connected");
  }
});

module.exports = db;
