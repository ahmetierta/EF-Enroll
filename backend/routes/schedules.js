const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all schedules with course info
router.get("/", (req, res) => {
  const sql = `
    SELECT
      schedules.id,
      schedules.course_id,
      schedules.dita,
      schedules.ora_fillimit,
      schedules.ora_perfundimit,
      schedules.salla,
      courses.emertimi AS course_name
    FROM schedules
    LEFT JOIN courses ON schedules.course_id = courses.id
    ORDER BY schedules.id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// GET schedule by id
router.get("/:id", (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT
      schedules.id,
      schedules.course_id,
      schedules.dita,
      schedules.ora_fillimit,
      schedules.ora_perfundimit,
      schedules.salla,
      courses.emertimi AS course_name
    FROM schedules
    LEFT JOIN courses ON schedules.course_id = courses.id
    WHERE schedules.id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// POST create schedule
router.post("/", (req, res) => {
  const { course_id, dita, ora_fillimit, ora_perfundimit, salla } = req.body;

  const sql =
    "INSERT INTO schedules (course_id, dita, ora_fillimit, ora_perfundimit, salla) VALUES (?, ?, ?, ?, ?)";

  db.query(
    sql,
    [course_id, dita, ora_fillimit, ora_perfundimit, salla],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Orari u shtua me sukses", result });
    }
  );
});

// PUT update schedule
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { course_id, dita, ora_fillimit, ora_perfundimit, salla } = req.body;

  const sql =
    "UPDATE schedules SET course_id = ?, dita = ?, ora_fillimit = ?, ora_perfundimit = ?, salla = ? WHERE id = ?";

  db.query(
    sql,
    [course_id, dita, ora_fillimit, ora_perfundimit, salla, id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Orari u perditesua me sukses", result });
    }
  );
});

// DELETE schedule
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM schedules WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Orari u fshi me sukses", result });
  });
});

module.exports = router;
