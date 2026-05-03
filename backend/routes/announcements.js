const express = require("express");
const router = express.Router();
const db = require("../db");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.get("/", requireRole("admin", "professor", "student"), (req, res) => {
  const sql = `
    SELECT
      announcements.id,
      announcements.course_id,
      announcements.titulli,
      announcements.permbajtja,
      announcements.data,
      announcements.professor_id,
      courses.emertimi AS course_name,
      users.username AS professor_name
    FROM announcements
    JOIN courses ON announcements.course_id = courses.id
    LEFT JOIN professors ON announcements.professor_id = professors.id
    LEFT JOIN users ON professors.user_id = users.id
    ORDER BY announcements.id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

router.post("/", requireRole("admin", "professor"), (req, res) => {
  const { course_id, titulli, permbajtja } = req.body;

  if (!course_id || !titulli || !permbajtja) {
    return res.status(400).json({ message: "Course, title and comment are required" });
  }

  const insertAnnouncement = (professorId) => {
    const sql =
      "INSERT INTO announcements (course_id, titulli, permbajtja, data, professor_id) VALUES (?, ?, ?, CURDATE(), ?)";

    db.query(sql, [course_id, titulli, permbajtja, professorId], (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({
        message: "Announcement created successfully",
        announcement_id: result.insertId,
      });
    });
  };

  if (req.user.role === "admin") {
    insertAnnouncement(null);
    return;
  }

  db.query(
    "SELECT id FROM professors WHERE user_id = ?",
    [req.user.id],
    (err, professors) => {
      if (err) return res.status(500).json(err);
      if (professors.length === 0) {
        return res.status(404).json({ message: "Professor profile not found" });
      }

      insertAnnouncement(professors[0].id);
    }
  );
});

module.exports = router;
