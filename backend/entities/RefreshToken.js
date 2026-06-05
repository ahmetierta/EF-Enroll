const { EntitySchema } = require("typeorm");

const RefreshToken = new EntitySchema({
  name: "RefreshToken",
  tableName: "refresh_tokens",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    token_hash: {
      type: "varchar",
      length: 64,
      unique: true,
    },
    expires_at: {
      type: "timestamp",
    },
    revoked_at: {
      type: "timestamp",
      nullable: true,
    },
    replaced_by_token_hash: {
      type: "varchar",
      length: 64,
      nullable: true,
    },
    user_agent: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    ip_address: {
      type: "varchar",
      length: 45,
      nullable: true,
    },
    last_seen_at: {
      type: "timestamp",
      nullable: true,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "user_id",
      },
      nullable: false,
      onDelete: "CASCADE",
    },
  },
});

module.exports = RefreshToken;
