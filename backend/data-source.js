require("reflect-metadata");

const { DataSource } = require("typeorm");
const Announcement = require("./entities/Announcement");
const Course = require("./entities/Course");
const CourseMaterial = require("./entities/CourseMaterial");
const Department = require("./entities/Department");
const Enrollment = require("./entities/Enrollment");
const Payment = require("./entities/Payment");
const Professor = require("./entities/Professor");
const Schedule = require("./entities/Schedule");
const Semester = require("./entities/Semester");
const Student = require("./entities/Student");
const User = require("./entities/User");
const WaitingList = require("./entities/WaitingList");

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "ErtaFiorela123",
  database: process.env.DB_NAME || "ef_enroll",
  synchronize: false,
  logging: false,
  entities: [
    User,
    Student,
    Professor,
    Department,
    Semester,
    Course,
    Schedule,
    Enrollment,
    Payment,
    WaitingList,
    Announcement,
    CourseMaterial,
  ],
});

module.exports = AppDataSource;
