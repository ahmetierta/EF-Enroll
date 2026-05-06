const { EntitySchema } = require("typeorm");

const Semester = new EntitySchema({
  name: "Semester",
  tableName: "semesters",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    emertimi: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    data_fillimit: {
      type: "date",
      nullable: true,
    },
    data_perfundimit: {
      type: "date",
      nullable: true,
    },
    statusi: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
  },
  relations: {
    courses: {
      type: "one-to-many",
      target: "Course",
      inverseSide: "semester",
    },
  },
});

module.exports = Semester;
