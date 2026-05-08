const { EntitySchema } = require("typeorm");

const Student = new EntitySchema({
  name: "Student",
  tableName: "students",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    numri_studentit: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    programi: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    viti_studimit: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    user: {
      type: "one-to-one",
      target: "User",
      joinColumn: {
        name: "user_id",
      },
      nullable: true,
      onDelete: "NO ACTION",
    },
    enrollments: {
      type: "one-to-many",
      target: "Enrollment",
      inverseSide: "student",
    },
    waitingListItems: {
      type: "one-to-many",
      target: "WaitingList",
      inverseSide: "student",
    },
  },
});

module.exports = Student;
