const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "ErtaFiorela123",
  database: "ef_enroll"
});

db.connect((err) => {
  if (err) {
    console.log("Gabim ne lidhje me databaze:", err.message);
  } else {
    console.log("Lidhja me databaze u be me sukses");
  }
});

app.get("/", (req, res) => {
  res.send("Backend po punon");
});

app.listen(5000, () => {
  console.log("Serveri po punon ne portin 5000");
});