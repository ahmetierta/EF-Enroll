const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "ErtaFiorela123",
  database: "ef_enroll"
});

db.connect((err) => {
  if (err) {
    console.log("Gabim ne lidhje me databaze:", err);
  } else {
    console.log("Database connected");
  }
});

module.exports = db;