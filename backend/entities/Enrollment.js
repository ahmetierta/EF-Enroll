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
      nullable: false,
    },
    statusi: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    nota: {
      type: "int",
      nullable: true,
    },
    kohezgjatja_muaj: {
      type: "int",
      default: 1,
    },
    cmimi_baze: {
      type: "decimal",
      precision: 10,
      scale: 2,
      default: 0,
    },
    zbritja_perqindje: {
      type: "decimal",
      precision: 5,
      scale: 2,
      default: 0,
    },
    cmimi_final: {
      type: "decimal",
      precision: 10,
      scale: 2,
      default: 0,
    },
    oferta_fillestare: {
      type: "boolean",
      default: false,
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
    payments: {
      type: "one-to-many",
      target: "Payment",
      inverseSide: "enrollment",
    },
  },
});

module.exports = Enrollment;
