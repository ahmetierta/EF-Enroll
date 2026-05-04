const express = require("express");
const router = express.Router();
const db = require("../db");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.get("/", requireRole("admin", "professor", "student"), (req, res) => {
  const professorFilter =
    req.user.role === "professor" ? "WHERE professors.user_id = ?" : "";

  const sql = `
    SELECT
      course_materials.id,
      course_materials.course_id,
      course_materials.professor_id,
      course_materials.titulli,
      course_materials.file_url,
      course_materials.data,
      courses.emertimi AS course_name,
      users.username AS professor_name
    FROM course_materials
    JOIN courses ON course_materials.course_id = courses.id
    LEFT JOIN professors ON course_materials.professor_id = professors.id
    LEFT JOIN users ON professors.user_id = users.id
    ${professorFilter}
    ORDER BY course_materials.id DESC
  `;

  const params = req.user.role === "professor" ? [req.user.id] : [];

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

router.post("/", requireRole("admin", "professor"), (req, res) => {
  const { course_id, titulli, file_url } = req.body;

  if (!course_id || !titulli || !file_url) {
    return res.status(400).json({
      message: "Course, title and file link are required",
    });
  }

  const insertMaterial = (professorId) => {
    const sql =
      "INSERT INTO course_materials (course_id, professor_id, titulli, file_url) VALUES (?, ?, ?, ?)";

    db.query(sql, [course_id, professorId, titulli, file_url], (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({
        message: "Material added successfully",
        material_id: result.insertId,
      });
    });
  };

  if (req.user.role === "admin") {
    insertMaterial(null);
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

      const professorId = professors[0].id;

      db.query(
        "SELECT id FROM courses WHERE id = ? AND professor_id = ?",
        [course_id, professorId],
        (err, courses) => {
          if (err) return res.status(500).json(err);
          if (courses.length === 0) {
            return res.status(403).json({
              message: "You can only add materials for your own courses",
            });
          }

          insertMaterial(professorId);
        }
      );
    }
  );
});

module.exports = router;
