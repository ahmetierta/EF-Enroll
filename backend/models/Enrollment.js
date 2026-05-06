const { EntitySchema } = require("typeorm");

const Enrollment = new EntitySchema({
  name: "Enrollment",
  tableName: "enrollments",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    data_regjistrimit: {
      type: "date",
      nullable: true,
    },
    statusi: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    nota: {
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
    payments: {
      type: "one-to-many",
      target: "Payment",
      inverseSide: "enrollment",
    },
  },
});

module.exports = Enrollment;
