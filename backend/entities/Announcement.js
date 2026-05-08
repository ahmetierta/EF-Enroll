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
      nullable: true,
    },
    permbajtja: {
      type: "text",
      nullable: true,
    },
    data: {
      type: "date",
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
    professor: {
      type: "many-to-one",
      target: "Professor",
      joinColumn: {
        name: "professor_id",
      },
      nullable: true,
      onDelete: "NO ACTION",
    },
  },
});

module.exports = Announcement;
