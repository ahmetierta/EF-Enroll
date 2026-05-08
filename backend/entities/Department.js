const { EntitySchema } = require("typeorm");

const Department = new EntitySchema({
  name: "Department",
  tableName: "departments",
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
    shefi_departamentit: {
      type: "varchar",
      length: 150,
      nullable: true,
    },
  },
});

module.exports = Department;
