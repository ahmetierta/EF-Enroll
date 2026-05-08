const express = require("express");
const router = express.Router();
const AppDataSource = require("../data-source");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

router.use(authenticateToken);

function mapPayment(payment) {
  return {
    id: payment.id,
    enrollment_id: payment.enrollment?.id || null,
    amount: payment.amount,
    statusi: payment.statusi,
    payment_method: payment.payment_method,
    data_pageses: payment.data_pageses,
    student_id: payment.enrollment?.student?.id || null,
    course_id: payment.enrollment?.course?.id || null,
    numri_studentit: payment.enrollment?.student?.numri_studentit || null,
    student_name: payment.enrollment?.student?.user?.username || null,
    student_email: payment.enrollment?.student?.user?.email || null,
    course_name: payment.enrollment?.course?.emertimi || null,
    course_price: payment.enrollment?.course?.cmimi || 0,
  };
}

function mapStudentPayment(payment) {
  return {
    id: payment.id,
    enrollment_id: payment.enrollment?.id || null,
    amount: payment.amount,
    statusi: payment.statusi,
    payment_method: payment.payment_method,
    data_pageses: payment.data_pageses,
    course_name: payment.enrollment?.course?.emertimi || null,
  };
}

// GET revenue summary for admin dashboard
router.get("/revenue/summary", requireRole("admin"), async (req, res) => {
  try {
    const paymentRepository = AppDataSource.getRepository("Payment");
    const totals = await paymentRepository
      .createQueryBuilder("payment")
      .select("COALESCE(SUM(payment.amount), 0)", "total_revenue")
      .addSelect("COUNT(payment.id)", "total_payments")
      .where("payment.statusi = :status", { status: "paid" })
      .getRawOne();

    const byCourse = await paymentRepository
      .createQueryBuilder("payment")
      .innerJoin("payment.enrollment", "enrollment")
      .innerJoin("enrollment.course", "course")
      .select("course.id", "course_id")
      .addSelect("course.emertimi", "course_name")
      .addSelect("COALESCE(SUM(payment.amount), 0)", "revenue")
      .addSelect("COUNT(payment.id)", "payments_count")
      .where("payment.statusi = :status", { status: "paid" })
      .groupBy("course.id")
      .addGroupBy("course.emertimi")
      .orderBy("revenue", "DESC")
      .getRawMany();

    res.json({
      total_revenue: Number(totals?.total_revenue || 0),
      total_payments: Number(totals?.total_payments || 0),
      by_course: byCourse,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET payments for admin dashboard
router.get("/", requireRole("admin"), async (req, res) => {
  try {
    const payments = await AppDataSource.getRepository("Payment")
      .createQueryBuilder("payment")
      .leftJoinAndSelect("payment.enrollment", "enrollment")
      .leftJoinAndSelect("enrollment.student", "student")
      .leftJoinAndSelect("student.user", "studentUser")
      .leftJoinAndSelect("enrollment.course", "course")
      .leftJoinAndSelect("course.professor", "professor")
      .leftJoinAndSelect("professor.user", "professorUser")
      .orderBy("payment.id", "DESC")
      .getMany();

    res.json(payments.map(mapPayment));
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET logged-in student's payments
router.get("/mine", requireRole("student"), async (req, res) => {
  try {
    const payments = await AppDataSource.getRepository("Payment")
      .createQueryBuilder("payment")
      .leftJoinAndSelect("payment.enrollment", "enrollment")
      .leftJoinAndSelect("enrollment.student", "student")
      .leftJoinAndSelect("student.user", "user")
      .leftJoinAndSelect("enrollment.course", "course")
      .where("user.id = :userId", { userId: req.user.id })
      .orderBy("payment.id", "DESC")
      .getMany();

    res.json(payments.map(mapStudentPayment));
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST simulated payment for logged-in student's enrollment
router.post("/", requireRole("student"), async (req, res) => {
  const { enrollment_id } = req.body;

  if (!enrollment_id) {
    return res.status(400).json({ message: "Enrollment is required" });
  }

  try {
    const enrollmentRepository = AppDataSource.getRepository("Enrollment");
    const paymentRepository = AppDataSource.getRepository("Payment");
    const enrollment = await enrollmentRepository.findOne({
      where: {
        id: Number(enrollment_id),
        student: {
          user: { id: req.user.id },
        },
      },
      relations: {
        student: {
          user: true,
        },
        course: true,
      },
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    const existingPayment = await paymentRepository.findOne({
      where: {
        enrollment: { id: Number(enrollment_id) },
        statusi: "paid",
      },
    });

    if (existingPayment) {
      return res.status(409).json({
        message: "This enrollment is already paid",
      });
    }

    const amount = Number(enrollment.course?.cmimi || 0);
    const payment = await paymentRepository.save({
      enrollment,
      amount,
      statusi: "paid",
      payment_method: "simulated",
    });

    res.status(201).json({
      message: "Payment completed successfully",
      payment_id: payment.id,
      amount,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
