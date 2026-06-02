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
    invoice_number: {
      type: "varchar",
      length: 50,
      nullable: false,
      unique: true,
    },
    transaction_id: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    currency: {
      type: "varchar",
      length: 10,
      default: "EUR",
    },
    payer_name: {
      type: "varchar",
      length: 150,
      nullable: true,
    },
    payer_email: {
      type: "varchar",
      length: 150,
      nullable: true,
    },
    notes: {
      type: "text",
      nullable: true,
    },
    refunded_at: {
      type: "timestamp",
      nullable: true,
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
      nullable: false,
      onDelete: "NO ACTION",
    },
  },
});

module.exports = Payment;
