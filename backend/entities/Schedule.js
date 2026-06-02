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
      nullable: false,
    },
    ora_fillimit: {
      type: "time",
      nullable: false,
    },
    ora_perfundimit: {
      type: "time",
      nullable: false,
    },
    salla: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
  },
  relations: {
    course: {
      type: "many-to-one",
      target: "Course",
      joinColumn: {
        name: "course_id",
      },
      nullable: false,
      onDelete: "NO ACTION",
    },
  },
});

module.exports = Schedule;
