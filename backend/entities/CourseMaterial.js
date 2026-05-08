const { EntitySchema } = require("typeorm");

const CourseMaterial = new EntitySchema({
  name: "CourseMaterial",
  tableName: "course_materials",
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
    file_url: {
      type: "varchar",
      length: 500,
      nullable: true,
    },
    data: {
      type: "timestamp",
      createDate: true,
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

module.exports = CourseMaterial;
