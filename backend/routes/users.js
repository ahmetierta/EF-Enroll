const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all users
router.get("/", (req, res) => {
  const sql = "SELECT * FROM users";

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// GET user by id
router.get("/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM users WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// POST create user
router.post("/", (req, res) => {
  const { username, email, password_hash } = req.body;

  const sql =
    "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";

  db.query(sql, [username, email, password_hash], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "User u krijua me sukses", result });
  });
});

// PUT update user
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { username, email, password_hash } = req.body;

  const sql =
    "UPDATE users SET username = ?, email = ?, password_hash = ? WHERE id = ?";

  db.query(sql, [username, email, password_hash, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "User u perditesua me sukses", result });
  });
});

// DELETE user
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM users WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "User u fshi me sukses", result });
  });
});

module.exports = router;