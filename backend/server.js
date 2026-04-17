const express = require("express");
const cors = require("cors");

const studentsRoutes = require("./routes/students");
const usersRoutes = require("./routes/users");
const professorsRoutes = require("./routes/professors");
const semestersRoutes = require("./routes/semesters");
const departmentsRoutes = require("./routes/departments");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/students", studentsRoutes);
app.use("/users", usersRoutes);
app.use("/professors", professorsRoutes);
app.use("/semesters", semestersRoutes);
app.use("/departments", departmentsRoutes);

app.get("/", (req, res) => {
  res.send("Backend po punon");
});

app.listen(5000, () => {
  console.log("Serveri po punon ne portin 5000");
});
