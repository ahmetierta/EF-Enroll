const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const AppDataSource = require("../data-source");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

router.use(authenticateToken);

const PAYMENT_METHODS = ["simulated", "card", "bank_transfer", "cash"];

function createInvoiceNumber(enrollmentId) {
  const year = new Date().getFullYear();
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `INV-${year}-${String(enrollmentId).padStart(6, "0")}-${randomPart}`;
}

function createTransactionId(method) {
  return `${String(method || "SIM").toUpperCase()}-${crypto
    .randomBytes(6)
    .toString("hex")
    .toUpperCase()}`;
}

function mapPayment(payment) {
  return {
    id: payment.id,
    enrollment_id: payment.enrollment?.id || null,
    amount: payment.amount,
    statusi: payment.statusi,
    payment_method: payment.payment_method,
    invoice_number: payment.invoice_number,
    transaction_id: payment.transaction_id,
    currency: payment.currency || "EUR",
    payer_name: payment.payer_name,
    payer_email: payment.payer_email,
    notes: payment.notes,
    refunded_at: payment.refunded_at,
    data_pageses: payment.data_pageses,
    student_id: payment.enrollment?.student?.id || null,
    course_id: payment.enrollment?.course?.id || null,
    numri_studentit: payment.enrollment?.student?.numri_studentit || null,
    student_name: payment.enrollment?.student?.user?.username || null,
    student_email: payment.enrollment?.student?.user?.email || null,
    course_name: payment.enrollment?.course?.emertimi || null,
    course_price: payment.enrollment?.course?.cmimi || 0,
    duration_months: payment.enrollment?.kohezgjatja_muaj || 1,
    discount_percent: payment.enrollment?.zbritja_perqindje || 0,
    final_amount: payment.enrollment?.cmimi_final || payment.amount,
  };
}

function mapStudentPayment(payment) {
  return {
    id: payment.id,
    enrollment_id: payment.enrollment?.id || null,
    amount: payment.amount,
    statusi: payment.statusi,
    payment_method: payment.payment_method,
    invoice_number: payment.invoice_number,
    transaction_id: payment.transaction_id,
    currency: payment.currency || "EUR",
    refunded_at: payment.refunded_at,
    data_pageses: payment.data_pageses,
    course_name: payment.enrollment?.course?.emertimi || null,
    duration_months: payment.enrollment?.kohezgjatja_muaj || 1,
    discount_percent: payment.enrollment?.zbritja_perqindje || 0,
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
  const {
    enrollment_id,
    payment_method = "simulated",
    payer_name,
    payer_email,
    notes,
  } = req.body;
  const normalizedPaymentMethod = String(payment_method || "simulated").trim();

  if (!enrollment_id) {
    return res.status(400).json({ message: "Enrollment is required" });
  }

  if (!PAYMENT_METHODS.includes(normalizedPaymentMethod)) {
    return res.status(400).json({
      message: "Payment method is not supported",
      supported_methods: PAYMENT_METHODS,
    });
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

    if (enrollment.statusi !== "active") {
      return res.status(409).json({
        message: "Only active enrollments can be paid",
      });
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

    const amount = Number(enrollment.cmimi_final || enrollment.course?.cmimi || 0);
    const payment = await paymentRepository.save({
      enrollment,
      amount,
      statusi: "paid",
      payment_method: normalizedPaymentMethod,
      invoice_number: createInvoiceNumber(enrollment.id),
      transaction_id: createTransactionId(normalizedPaymentMethod),
      currency: "EUR",
      payer_name:
        payer_name || enrollment.student?.user?.username || req.user.username || null,
      payer_email:
        payer_email || enrollment.student?.user?.email || req.user.email || null,
      notes: notes ? String(notes).trim() : null,
    });

    res.status(201).json({
      message: "Payment completed successfully",
      payment_id: payment.id,
      amount,
      currency: payment.currency,
      invoice_number: payment.invoice_number,
      transaction_id: payment.transaction_id,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/:id/refund", requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);

  try {
    const paymentRepository = AppDataSource.getRepository("Payment");
    const payment = await paymentRepository.findOne({
      where: { id },
      relations: {
        enrollment: {
          student: {
            user: true,
          },
          course: true,
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.statusi === "refunded") {
      return res.status(409).json({ message: "Payment is already refunded" });
    }

    payment.statusi = "refunded";
    payment.refunded_at = new Date();
    payment.notes = req.body.notes
      ? String(req.body.notes).trim()
      : payment.notes || "Refunded by admin";

    const savedPayment = await paymentRepository.save(payment);

    res.json({
      message: "Payment refunded successfully",
      payment: mapPayment(savedPayment),
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
