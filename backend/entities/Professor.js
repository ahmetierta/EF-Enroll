const { EntitySchema } = require("typeorm");

const Professor = new EntitySchema({
  name: "Professor",
  tableName: "professors",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    titulli: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    departamenti: {
      type: "varchar",
      length: 150,
      nullable: false,
    },
  },
  relations: {
    user: {
      type: "one-to-one",
      target: "User",
      joinColumn: {
        name: "user_id",
      },
      nullable: false,
      onDelete: "NO ACTION",
    },
    courses: {
      type: "one-to-many",
      target: "Course",
      inverseSide: "professor",
    },
    announcements: {
      type: "one-to-many",
      target: "Announcement",
      inverseSide: "professor",
    },
    materials: {
      type: "one-to-many",
      target: "CourseMaterial",
      inverseSide: "professor",
    },
  },
});

module.exports = Professor;
