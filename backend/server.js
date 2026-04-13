const express = require("express");
const cors = require("cors");

const studentsRoutes = require("./routes/students");
const usersRoutes = require("./routes/users");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/students", studentsRoutes);
app.use("/users", usersRoutes);

app.get("/", (req, res) => {
  res.send("Backend po punon");
});

app.listen(5000, () => {
  console.log("Serveri po punon ne portin 5000");
});