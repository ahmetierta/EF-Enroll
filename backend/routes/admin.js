const express = require("express");
const db = require("../db");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole("admin"));

router.get("/pending-professors", (req, res) => {
  const sql = `
    SELECT
      users.id AS user_id,
      users.username,
      users.email,
      users.role,
      users.status,
      users.created_at,
      professors.id AS professor_id,
      professors.titulli,
      professors.departamenti
    FROM users
    JOIN professors ON professors.user_id = users.id
    WHERE users.role = 'professor' AND users.status = 'pending'
    ORDER BY users.created_at DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

router.put("/users/:id/approve", (req, res) => {
  const userId = req.params.id;
  const sql =
    "UPDATE users SET status = 'approved' WHERE id = ? AND role = 'professor'";

  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Professor account not found" });
    }

    res.json({ message: "Professor account approved" });
  });
});

router.put("/users/:id/reject", (req, res) => {
  const userId = req.params.id;
  const sql =
    "UPDATE users SET status = 'rejected' WHERE id = ? AND role = 'professor'";

  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Professor account not found" });
    }

    res.json({ message: "Professor account rejected" });
  });
});

module.exports = router;
