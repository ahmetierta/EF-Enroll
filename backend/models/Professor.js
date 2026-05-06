const { EntitySchema } = require("typeorm");

const Professor = new EntitySchema({
  name: "Professor",
  tableName: "professors",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    titulli: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    departamenti: {
      type: "varchar",
      length: 150,
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
  },
});

module.exports = Professor;
