require("reflect-metadata");

const { DataSource } = require("typeorm");
const Professor = require("./models/Professor");
const Student = require("./models/Student");
const User = require("./models/User");

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "ErtaFiorela123",
  database: process.env.DB_NAME || "ef_enroll",
  synchronize: false,
  logging: false,
  entities: [User, Student, Professor],
});

module.exports = AppDataSource;
