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
      nullable: true,
    },
    pozicioni: {
      type: "int",
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
      nullable: true,
      onDelete: "NO ACTION",
    },
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

module.exports = WaitingList;
