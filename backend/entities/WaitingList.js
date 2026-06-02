const { EntitySchema } = require("typeorm");

const WaitingList = new EntitySchema({
  name: "WaitingList",
  tableName: "waiting_list",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    data: {
      type: "date",
      nullable: false,
    },
    pozicioni: {
      type: "int",
      nullable: false,
    },
    statusi: {
      type: "varchar",
      length: 30,
      default: "waiting",
    },
    prioriteti: {
      type: "varchar",
      length: 30,
      default: "normal",
    },
    arsyeja: {
      type: "text",
      nullable: true,
    },
    njofto_me_email: {
      type: "boolean",
      default: true,
    },
    data_njoftimit: {
      type: "timestamp",
      nullable: true,
    },
    afati_pergjigjes: {
      type: "timestamp",
      nullable: true,
    },
  },
  relations: {
    student: {
      type: "many-to-one",
      target: "Student",
      joinColumn: {
        name: "student_id",
      },
      nullable: false,
      onDelete: "NO ACTION",
    },
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

module.exports = WaitingList;
