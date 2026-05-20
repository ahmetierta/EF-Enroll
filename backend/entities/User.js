const { EntitySchema } = require("typeorm");

const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    username: {
      type: "varchar",
      length: 100,
    },
    email: {
      type: "varchar",
      length: 150,
    },
    password_hash: {
      type: "varchar",
      length: 255,
    },
    reset_password_token: {
      type: "varchar",
      length: 64,
      nullable: true,
    },
    reset_password_expires: {
      type: "timestamp",
      nullable: true,
    },
    role: {
      type: "enum",
      enum: ["admin", "professor", "student"],
      default: "student",
    },
    status: {
      type: "enum",
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    created_at: {
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    student: {
      type: "one-to-one",
      target: "Student",
      inverseSide: "user",
    },
    professor: {
      type: "one-to-one",
      target: "Professor",
      inverseSide: "user",
    },
  },
});

module.exports = User;
