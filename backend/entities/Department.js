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
      nullable: false,
    },
    pershkrimi: {
      type: "text",
      nullable: false,
    },
    shefi_departamentit: {
      type: "varchar",
      length: 150,
      nullable: false,
    },
  },
});

module.exports = Department;
