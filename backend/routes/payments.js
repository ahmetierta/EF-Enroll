const express = require("express");
const router = express.Router();
const db = require("../db");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

router.use(authenticateToken);

// GET payments for admin/professor dashboards
router.get("/", requireRole("admin", "professor"), (req, res) => {
  const professorFilter =
    req.user.role === "professor" ? "WHERE professors.user_id = ?" : "";

  const sql = `
    SELECT
      payments.id,
      payments.enrollment_id,
      payments.amount,
      payments.statusi,
      payments.payment_method,
      payments.data_pageses,
      enrollments.student_id,
      enrollments.course_id,
      students.numri_studentit,
      users.username AS student_name,
      users.email AS student_email,
      courses.emertimi AS course_name,
      courses.cmimi AS course_price
    FROM payments
    JOIN enrollments ON payments.enrollment_id = enrollments.id
    JOIN students ON enrollments.student_id = students.id
    JOIN users ON students.user_id = users.id
    JOIN courses ON enrollments.course_id = courses.id
    LEFT JOIN professors ON courses.professor_id = professors.id
    ${professorFilter}
    ORDER BY payments.id DESC
  `;

  const params = req.user.role === "professor" ? [req.user.id] : [];

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// GET logged-in student's payments
router.get("/mine", requireRole("student"), (req, res) => {
  const sql = `
    SELECT
      payments.id,
      payments.enrollment_id,
      payments.amount,
      payments.statusi,
      payments.payment_method,
      payments.data_pageses,
      courses.emertimi AS course_name
    FROM payments
    JOIN enrollments ON payments.enrollment_id = enrollments.id
    JOIN students ON enrollments.student_id = students.id
    JOIN courses ON enrollments.course_id = courses.id
    WHERE students.user_id = ?
    ORDER BY payments.id DESC
  `;

  db.query(sql, [req.user.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// POST simulated payment for logged-in student's enrollment
router.post("/", requireRole("student"), (req, res) => {
  const { enrollment_id } = req.body;

  if (!enrollment_id) {
    return res.status(400).json({ message: "Enrollment is required" });
  }

  const enrollmentSql = `
    SELECT
      enrollments.id,
      courses.cmimi
    FROM enrollments
    JOIN students ON enrollments.student_id = students.id
    JOIN courses ON enrollments.course_id = courses.id
    WHERE enrollments.id = ? AND students.user_id = ?
  `;

  db.query(enrollmentSql, [enrollment_id, req.user.id], (err, enrollments) => {
    if (err) return res.status(500).json(err);

    if (enrollments.length === 0) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    const duplicateSql =
      "SELECT id FROM payments WHERE enrollment_id = ? AND statusi = 'paid'";

    db.query(duplicateSql, [enrollment_id], (err, existingPayments) => {
      if (err) return res.status(500).json(err);

      if (existingPayments.length > 0) {
        return res.status(409).json({
          message: "This enrollment is already paid",
        });
      }

      const amount = Number(enrollments[0].cmimi || 0);
      const paymentSql =
        "INSERT INTO payments (enrollment_id, amount, statusi, payment_method) VALUES (?, ?, 'paid', 'simulated')";

      db.query(paymentSql, [enrollment_id, amount], (err, result) => {
        if (err) return res.status(500).json(err);

        res.status(201).json({
          message: "Payment completed successfully",
          payment_id: result.insertId,
          amount,
        });
      });
    });
  });
});

module.exports = router;
