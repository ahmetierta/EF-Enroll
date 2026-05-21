require("reflect-metadata");

const { DataSource } = require("typeorm");
const { database } = require("./config/env");
const Announcement = require("./entities/Announcement");
const Course = require("./entities/Course");
const CourseMaterial = require("./entities/CourseMaterial");
const Department = require("./entities/Department");
const Enrollment = require("./entities/Enrollment");
const Payment = require("./entities/Payment");
const Professor = require("./entities/Professor");
const RefreshToken = require("./entities/RefreshToken");
const Schedule = require("./entities/Schedule");
const Semester = require("./entities/Semester");
const Student = require("./entities/Student");
const User = require("./entities/User");
const WaitingList = require("./entities/WaitingList");

const AppDataSource = new DataSource({
  type: "mysql",
  host: database.host,
  port: database.port,
  username: database.user,
  password: database.password,
  database: database.name,
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
    RefreshToken,
    WaitingList,
    Announcement,
    CourseMaterial,
  ],
});

module.exports = AppDataSource;
