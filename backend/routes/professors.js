const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all professors with user info
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      professors.id,
      professors.user_id,
      professors.titulli,
      professors.departamenti,
      users.username,
      users.email
    FROM professors
    JOIN users ON professors.user_id = users.id
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// GET professor by id with user info
router.get("/:id", (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT 
      professors.id,
      professors.user_id,
      professors.titulli,
      professors.departamenti,
      users.username,
      users.email
    FROM professors
    JOIN users ON professors.user_id = users.id
    WHERE professors.id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// POST create user + professor
router.post("/", (req, res) => {
  const {
    username,
    email,
    password_hash,
    titulli,
    departamenti,
  } = req.body;

  const sqlUser =
    "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";

  db.query(sqlUser, [username, email, password_hash], (err, userResult) => {
    if (err) return res.status(500).json(err);

    const user_id = userResult.insertId;

    const sqlProfessor =
      "INSERT INTO professors (user_id, titulli, departamenti) VALUES (?, ?, ?)";

    db.query(
      sqlProfessor,
      [user_id, titulli, departamenti],
      (err, professorResult) => {
        if (err) return res.status(500).json(err);

        res.json({
          message: "User dhe profesori u krijuan me sukses",
          user_id: user_id,
          professor_id: professorResult.insertId,
        });
      }
    );
  });
});

// PUT update user + professor
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const {
    username,
    email,
    password_hash,
    titulli,
    departamenti,
  } = req.body;

  const sqlFindProfessor = "SELECT * FROM professors WHERE id = ?";

  db.query(sqlFindProfessor, [id], (err, professorRows) => {
    if (err) return res.status(500).json(err);

    if (professorRows.length === 0) {
      return res.status(404).json({ message: "Profesori nuk u gjet" });
    }

    const user_id = professorRows[0].user_id;

    const sqlUpdateUser =
      "UPDATE users SET username = ?, email = ?, password_hash = ? WHERE id = ?";

    db.query(
      sqlUpdateUser,
      [username, email, password_hash, user_id],
      (err, userResult) => {
        if (err) return res.status(500).json(err);

        const sqlUpdateProfessor =
          "UPDATE professors SET titulli = ?, departamenti = ? WHERE id = ?";

        db.query(
          sqlUpdateProfessor,
          [titulli, departamenti, id],
          (err, professorResult) => {
            if (err) return res.status(500).json(err);

            res.json({
              message: "User dhe profesori u perditesuan me sukses",
              userResult,
              professorResult,
            });
          }
        );
      }
    );
  });
});

// DELETE professor + user
router.delete("/:id", (req, res) => {
  const id = req.params.id;

  const sqlFindProfessor = "SELECT * FROM professors WHERE id = ?";

  db.query(sqlFindProfessor, [id], (err, professorRows) => {
    if (err) return res.status(500).json(err);

    if (professorRows.length === 0) {
      return res.status(404).json({ message: "Profesori nuk u gjet" });
    }

    const user_id = professorRows[0].user_id;

    const sqlDeleteProfessor = "DELETE FROM professors WHERE id = ?";

    db.query(sqlDeleteProfessor, [id], (err, professorResult) => {
      if (err) return res.status(500).json(err);

      const sqlDeleteUser = "DELETE FROM users WHERE id = ?";

      db.query(sqlDeleteUser, [user_id], (err, userResult) => {
        if (err) return res.status(500).json(err);

        res.json({
          message: "Profesori dhe user-i u fshine me sukses",
          professorResult,
          userResult,
        });
      });
    });
  });
});

module.exports = router;