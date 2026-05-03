const express = require("express");
const router = express.Router();
const db = require("../db");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

router.use(authenticateToken);

function getStudentForUser(userId, callback) {
  db.query(
    "SELECT id FROM students WHERE user_id = ?",
    [userId],
    (err, students) => {
      if (err) return callback(err);
      callback(null, students[0]);
    }
  );
}

// GET all enrollments with student and course details
router.get("/", requireRole("admin", "professor"), (req, res) => {
  const professorFilter =
    req.user.role === "professor" ? "WHERE professors.user_id = ?" : "";

  const sql = `
    SELECT
      enrollments.id,
      enrollments.student_id,
      enrollments.course_id,
      enrollments.data_regjistrimit,
      enrollments.statusi,
      enrollments.nota,
      students.numri_studentit,
      users.username AS student_name,
      users.email AS student_email,
      courses.emertimi AS course_name,
      courses.kredite,
      professors.user_id AS professor_user_id
    FROM enrollments
    JOIN students ON enrollments.student_id = students.id
    JOIN users ON students.user_id = users.id
    JOIN courses ON enrollments.course_id = courses.id
    LEFT JOIN professors ON courses.professor_id = professors.id
    ${professorFilter}
    ORDER BY enrollments.id DESC
  `;

  const params = req.user.role === "professor" ? [req.user.id] : [];

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// GET logged-in student's own enrollments
router.get("/mine", requireRole("student"), (req, res) => {
  getStudentForUser(req.user.id, (err, student) => {
    if (err) return res.status(500).json(err);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const sql = `
      SELECT
        enrollments.id,
        enrollments.student_id,
        enrollments.course_id,
        enrollments.data_regjistrimit,
        enrollments.statusi,
        enrollments.nota,
        courses.emertimi AS course_name,
        courses.kredite,
        users.username AS professor_name
      FROM enrollments
      JOIN courses ON enrollments.course_id = courses.id
      LEFT JOIN professors ON courses.professor_id = professors.id
      LEFT JOIN users ON professors.user_id = users.id
      WHERE enrollments.student_id = ?
      ORDER BY enrollments.id DESC
    `;

    db.query(sql, [student.id], (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    });
  });
});

// POST enroll logged-in student in a course
router.post("/", requireRole("student"), (req, res) => {
  const { course_id } = req.body;

  if (!course_id) {
    return res.status(400).json({ message: "Course is required" });
  }

  getStudentForUser(req.user.id, (err, student) => {
    if (err) return res.status(500).json(err);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const duplicateSql =
      "SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?";

    db.query(duplicateSql, [student.id, course_id], (err, existingRows) => {
      if (err) return res.status(500).json(err);
      if (existingRows.length > 0) {
        return res.status(409).json({
          message: "You are already enrolled in this course",
        });
      }

      const insertSql =
        "INSERT INTO enrollments (student_id, course_id, data_regjistrimit, statusi) VALUES (?, ?, CURDATE(), 'active')";

      db.query(insertSql, [student.id, course_id], (err, result) => {
        if (err) return res.status(500).json(err);

        res.status(201).json({
          message: "Enrollment created successfully",
          enrollment_id: result.insertId,
        });
      });
    });
  });
});

module.exports = router;
