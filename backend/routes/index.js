const express = require("express");

const coursesRoutes = require("./courses");
const departmentsRoutes = require("./departments");
const professorsRoutes = require("./professors");
const schedulesRoutes = require("./schedules");
const semestersRoutes = require("./semesters");
const studentsRoutes = require("./students");
const usersRoutes = require("./users");

const router = express.Router();

router.use("/courses", coursesRoutes);
router.use("/departments", departmentsRoutes);
router.use("/professors", professorsRoutes);
router.use("/schedules", schedulesRoutes);
router.use("/semesters", semestersRoutes);
router.use("/students", studentsRoutes);
router.use("/users", usersRoutes);

module.exports = router;
