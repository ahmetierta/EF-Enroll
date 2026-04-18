const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all courses with professor and semester info
router.get("/", (req, res) => {
  const sql = `
    SELECT
      courses.id,
      courses.emertimi,
      courses.pershkrimi,
      courses.kredite,
      courses.professor_id,
      courses.semester_id,
      courses.kapaciteti,
      professors.titulli,
      users.username AS professor_name,
      semesters.emertimi AS semester_name
    FROM courses
    LEFT JOIN professors ON courses.professor_id = professors.id
    LEFT JOIN users ON professors.user_id = users.id
    LEFT JOIN semesters ON courses.semester_id = semesters.id
    ORDER BY courses.id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// GET course by id with professor and semester info
router.get("/:id", (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT
      courses.id,
      courses.emertimi,
      courses.pershkrimi,
      courses.kredite,
      courses.professor_id,
      courses.semester_id,
      courses.kapaciteti,
      professors.titulli,
      users.username AS professor_name,
      semesters.emertimi AS semester_name
    FROM courses
    LEFT JOIN professors ON courses.professor_id = professors.id
    LEFT JOIN users ON professors.user_id = users.id
    LEFT JOIN semesters ON courses.semester_id = semesters.id
    WHERE courses.id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// POST create course
router.post("/", (req, res) => {
  const {
    emertimi,
    pershkrimi,
    kredite,
    professor_id,
    semester_id,
    kapaciteti,
  } = req.body;

  const sql =
    "INSERT INTO courses (emertimi, pershkrimi, kredite, professor_id, semester_id, kapaciteti) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(
    sql,
    [emertimi, pershkrimi, kredite, professor_id, semester_id, kapaciteti],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Kursi u shtua me sukses", result });
    }
  );
});

// PUT update course
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const {
    emertimi,
    pershkrimi,
    kredite,
    professor_id,
    semester_id,
    kapaciteti,
  } = req.body;

  const sql =
    "UPDATE courses SET emertimi = ?, pershkrimi = ?, kredite = ?, professor_id = ?, semester_id = ?, kapaciteti = ? WHERE id = ?";

  db.query(
    sql,
    [emertimi, pershkrimi, kredite, professor_id, semester_id, kapaciteti, id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Kursi u perditesua me sukses", result });
    }
  );
});

// DELETE course
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM courses WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Kursi u fshi me sukses", result });
  });
});

module.exports = router;
