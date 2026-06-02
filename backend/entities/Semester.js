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
      nullable: false,
    },
    data_fillimit: {
      type: "date",
      nullable: false,
    },
    data_perfundimit: {
      type: "date",
      nullable: false,
    },
    statusi: {
      type: "varchar",
      length: 50,
      nullable: false,
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
