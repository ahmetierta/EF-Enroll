const { EntitySchema } = require("typeorm");

const Announcement = new EntitySchema({
  name: "Announcement",
  tableName: "announcements",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    titulli: {
      type: "varchar",
      length: 200,
      nullable: false,
    },
    permbajtja: {
      type: "text",
      nullable: false,
    },
    data: {
      type: "date",
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
    professor: {
      type: "many-to-one",
      target: "Professor",
      joinColumn: {
        name: "professor_id",
      },
      nullable: false,
      onDelete: "NO ACTION",
    },
  },
});

module.exports = Announcement;
