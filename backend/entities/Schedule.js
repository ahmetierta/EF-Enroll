const { EntitySchema } = require("typeorm");

const Schedule = new EntitySchema({
  name: "Schedule",
  tableName: "schedules",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    dita: {
      type: "varchar",
      length: 20,
      nullable: true,
    },
    ora_fillimit: {
      type: "time",
      nullable: true,
    },
    ora_perfundimit: {
      type: "time",
      nullable: true,
    },
    salla: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
  },
  relations: {
    course: {
      type: "many-to-one",
      target: "Course",
      joinColumn: {
        name: "course_id",
      },
      nullable: true,
      onDelete: "NO ACTION",
    },
  },
});

module.exports = Schedule;
