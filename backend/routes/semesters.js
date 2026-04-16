const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all semesters
router.get("/", (req, res) => {
  const sql = "SELECT * FROM semesters";

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// GET semester by id
router.get("/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM semesters WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// POST create semester
router.post("/", (req, res) => {
  const { emertimi, data_fillimit, data_perfundimit, statusi } = req.body;

  const sql =
    "INSERT INTO semesters (emertimi, data_fillimit, data_perfundimit, statusi) VALUES (?, ?, ?, ?)";

  db.query(
    sql,
    [emertimi, data_fillimit, data_perfundimit, statusi],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Semestri u shtua me sukses", result });
    }
  );
});

// PUT update semester
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { emertimi, data_fillimit, data_perfundimit, statusi } = req.body;

  const sql =
    "UPDATE semesters SET emertimi = ?, data_fillimit = ?, data_perfundimit = ?, statusi = ? WHERE id = ?";

  db.query(
    sql,
    [emertimi, data_fillimit, data_perfundimit, statusi, id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Semestri u përditësua me sukses", result });
    }
  );
});

// DELETE semester
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM semesters WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Semestri u fshi me sukses", result });
  });
});

module.exports = router;
 