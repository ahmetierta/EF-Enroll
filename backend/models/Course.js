const { EntitySchema } = require("typeorm");

const Course = new EntitySchema({
  name: "Course",
  tableName: "courses",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    emertimi: {
      type: "varchar",
      length: 150,
      nullable: true,
    },
    pershkrimi: {
      type: "text",
      nullable: true,
    },
    kredite: {
      type: "int",
      nullable: true,
    },
    kapaciteti: {
      type: "int",
      nullable: true,
    },
    cmimi: {
      type: "decimal",
      precision: 10,
      scale: 2,
      default: 0,
    },
  },
  relations: {
    professor: {
      type: "many-to-one",
      target: "Professor",
      joinColumn: {
        name: "professor_id",
      },
      nullable: true,
      onDelete: "NO ACTION",
    },
    semester: {
      type: "many-to-one",
      target: "Semester",
      joinColumn: {
        name: "semester_id",
      },
      nullable: true,
      onDelete: "NO ACTION",
    },
    schedules: {
      type: "one-to-many",
      target: "Schedule",
      inverseSide: "course",
    },
    enrollments: {
      type: "one-to-many",
      target: "Enrollment",
      inverseSide: "course",
    },
    waitingListItems: {
      type: "one-to-many",
      target: "WaitingList",
      inverseSide: "course",
    },
    announcements: {
      type: "one-to-many",
      target: "Announcement",
      inverseSide: "course",
    },
    materials: {
      type: "one-to-many",
      target: "CourseMaterial",
      inverseSide: "course",
    },
  },
});

module.exports = Course;
