const db = require("../db");

const queries = [
  "ALTER TABLE users ADD COLUMN role ENUM('admin', 'professor', 'student') NOT NULL DEFAULT 'student'",
  "ALTER TABLE users ADD COLUMN status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'",
  "UPDATE users SET status = 'approved' WHERE status = 'pending'",
];

function runQuery(index) {
  if (index >= queries.length) {
    console.log("Auth migration completed");
    db.end();
    return;
  }

  db.query(queries[index], (err) => {
    if (err) {
      console.error(err);
      db.end();
      process.exit(1);
    }

    runQuery(index + 1);
  });
}

runQuery(0);
