const express = require("express");

const adminRoutes = require("./admin");
const announcementsRoutes = require("./announcements");
const authRoutes = require("./auth");
const coursesRoutes = require("./courses");
const departmentsRoutes = require("./departments");
const enrollmentsRoutes = require("./enrollments");
const materialsRoutes = require("./materials");
const paymentsRoutes = require("./payments");
const professorsRoutes = require("./professors");
const schedulesRoutes = require("./schedules");
const semestersRoutes = require("./semesters");
const studentsRoutes = require("./students");
const usersRoutes = require("./users");
const waitingListRoutes = require("./waitingList");

const router = express.Router();

router.use("/admin", adminRoutes);
router.use("/announcements", announcementsRoutes);
router.use("/auth", authRoutes);
router.use("/courses", coursesRoutes);
router.use("/departments", departmentsRoutes);
router.use("/enrollments", enrollmentsRoutes);
router.use("/materials", materialsRoutes);
router.use("/payments", paymentsRoutes);
router.use("/professors", professorsRoutes);
router.use("/schedules", schedulesRoutes);
router.use("/semesters", semestersRoutes);
router.use("/students", studentsRoutes);
router.use("/users", usersRoutes);
router.use("/waiting-list", waitingListRoutes);

module.exports = router;
