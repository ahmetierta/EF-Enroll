const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all departments
router.get("/", (req, res) => {
  const sql = "SELECT * FROM departments";

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// GET department by id
router.get("/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM departments WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// POST create department
router.post("/", (req, res) => {
  const { emertimi, pershkrimi, shefi_departamentit } = req.body;

  const sql =
    "INSERT INTO departments (emertimi, pershkrimi, shefi_departamentit) VALUES (?, ?, ?)";

  db.query(sql, [emertimi, pershkrimi, shefi_departamentit], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Departamenti u shtua me sukses", result });
  });
});

// PUT update department
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { emertimi, pershkrimi, shefi_departamentit } = req.body;

  const sql =
    "UPDATE departments SET emertimi = ?, pershkrimi = ?, shefi_departamentit = ? WHERE id = ?";

  db.query(sql, [emertimi, pershkrimi, shefi_departamentit, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Departamenti u përditësua me sukses", result });
  });
});

// DELETE department
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM departments WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Departamenti u fshi me sukses", result });
  });
});

module.exports = router;

 