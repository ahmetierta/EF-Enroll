const bcrypt = require("bcryptjs");
const db = require("../db");

const admin = {
  username: "admin",
  email: "admin@gmail.com",
  password: "admin123",
};

const passwordHash = bcrypt.hashSync(admin.password, 10);

const findSql = "SELECT id FROM users WHERE email = ?";

db.query(findSql, [admin.email], (err, users) => {
  if (err) {
    console.error(err);
    db.end();
    process.exit(1);
  }

  if (users.length > 0) {
    const updateSql =
      "UPDATE users SET username = ?, password_hash = ?, role = 'admin', status = 'approved' WHERE email = ?";

    db.query(updateSql, [admin.username, passwordHash, admin.email], (err) => {
      if (err) {
        console.error(err);
        db.end();
        process.exit(1);
      }

      console.log(`Admin updated: ${admin.email} / ${admin.password}`);
      db.end();
    });

    return;
  }

  const insertSql =
    "INSERT INTO users (username, email, password_hash, role, status) VALUES (?, ?, ?, 'admin', 'approved')";

  db.query(insertSql, [admin.username, admin.email, passwordHash], (err) => {
    if (err) {
      console.error(err);
      db.end();
      process.exit(1);
    }

    console.log(`Admin created: ${admin.email} / ${admin.password}`);
    db.end();
  });
});
