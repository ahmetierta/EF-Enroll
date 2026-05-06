require("reflect-metadata");

const { DataSource } = require("typeorm");
const Announcement = require("./models/Announcement");
const Course = require("./models/Course");
const CourseMaterial = require("./models/CourseMaterial");
const Department = require("./models/Department");
const Enrollment = require("./models/Enrollment");
const Payment = require("./models/Payment");
const Professor = require("./models/Professor");
const Schedule = require("./models/Schedule");
const Semester = require("./models/Semester");
const Student = require("./models/Student");
const User = require("./models/User");
const WaitingList = require("./models/WaitingList");

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
