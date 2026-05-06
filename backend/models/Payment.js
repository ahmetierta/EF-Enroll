const { EntitySchema } = require("typeorm");

const Payment = new EntitySchema({
  name: "Payment",
  tableName: "payments",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    amount: {
      type: "decimal",
      precision: 10,
      scale: 2,
    },
    statusi: {
      type: "varchar",
      length: 50,
      default: "paid",
    },
    payment_method: {
      type: "varchar",
      length: 50,
      default: "simulated",
    },
    data_pageses: {
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    enrollment: {
      type: "many-to-one",
      target: "Enrollment",
      joinColumn: {
        name: "enrollment_id",
      },
      nullable: true,
      onDelete: "NO ACTION",
    },
  },
});

module.exports = Payment;
