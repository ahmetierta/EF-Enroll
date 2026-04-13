const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all students with user info
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      students.id,
      students.user_id,
      students.numri_studentit,
      students.programi,
      students.viti_studimit,
      users.username,
      users.email
    FROM students
    JOIN users ON students.user_id = users.id
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// GET student by id with user info
router.get("/:id", (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT 
      students.id,
      students.user_id,
      students.numri_studentit,
      students.programi,
      students.viti_studimit,
      users.username,
      users.email
    FROM students
    JOIN users ON students.user_id = users.id
    WHERE students.id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// POST create user + student
router.post("/", (req, res) => {
  const {
    username,
    email,
    password_hash,
    numri_studentit,
    programi,
    viti_studimit,
  } = req.body;

  const sqlUser =
    "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";

  db.query(sqlUser, [username, email, password_hash], (err, userResult) => {
    if (err) return res.status(500).json(err);

    const user_id = userResult.insertId;

    const sqlStudent =
      "INSERT INTO students (user_id, numri_studentit, programi, viti_studimit) VALUES (?, ?, ?, ?)";

    db.query(
      sqlStudent,
      [user_id, numri_studentit, programi, viti_studimit],
      (err, studentResult) => {
        if (err) return res.status(500).json(err);

        res.json({
          message: "User dhe studenti u krijuan me sukses",
          user_id: user_id,
          student_id: studentResult.insertId,
        });
      }
    );
  });
});

// PUT update user + student
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const {
    username,
    email,
    password_hash,
    numri_studentit,
    programi,
    viti_studimit,
  } = req.body;

  const sqlFindStudent = "SELECT * FROM students WHERE id = ?";

  db.query(sqlFindStudent, [id], (err, studentRows) => {
    if (err) return res.status(500).json(err);

    if (studentRows.length === 0) {
      return res.status(404).json({ message: "Studenti nuk u gjet" });
    }

    const user_id = studentRows[0].user_id;

    const sqlUpdateUser =
      "UPDATE users SET username = ?, email = ?, password_hash = ? WHERE id = ?";

    db.query(
      sqlUpdateUser,
      [username, email, password_hash, user_id],
      (err, userResult) => {
        if (err) return res.status(500).json(err);

        const sqlUpdateStudent =
          "UPDATE students SET numri_studentit = ?, programi = ?, viti_studimit = ? WHERE id = ?";

        db.query(
          sqlUpdateStudent,
          [numri_studentit, programi, viti_studimit, id],
          (err, studentResult) => {
            if (err) return res.status(500).json(err);

            res.json({
              message: "User dhe studenti u perditesuan me sukses",
              userResult,
              studentResult,
            });
          }
        );
      }
    );
  });
});

// DELETE student + user
router.delete("/:id", (req, res) => {
  const id = req.params.id;

  const sqlFindStudent = "SELECT * FROM students WHERE id = ?";

  db.query(sqlFindStudent, [id], (err, studentRows) => {
    if (err) return res.status(500).json(err);

    if (studentRows.length === 0) {
      return res.status(404).json({ message: "Studenti nuk u gjet" });
    }

    const user_id = studentRows[0].user_id;

    const sqlDeleteStudent = "DELETE FROM students WHERE id = ?";

    db.query(sqlDeleteStudent, [id], (err, studentResult) => {
      if (err) return res.status(500).json(err);

      const sqlDeleteUser = "DELETE FROM users WHERE id = ?";

      db.query(sqlDeleteUser, [user_id], (err, userResult) => {
        if (err) return res.status(500).json(err);

        res.json({
          message: "Studenti dhe user-i u fshine me sukses",
          studentResult,
          userResult,
        });
      });
    });
  });
});

module.exports = router;