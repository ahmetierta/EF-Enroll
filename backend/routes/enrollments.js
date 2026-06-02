const express = require("express");
const router = express.Router();
const AppDataSource = require("../data-source");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");
const {
  DURATION_OPTIONS,
  calculateEnrollmentPricing,
  normalizeDurationMonths,
} = require("../utils/pricing");

router.use(authenticateToken);

async function getStudentForUser(userId) {
  return AppDataSource.getRepository("Student").findOne({
    where: { user: { id: userId } },
  });
}

function mapEnrollment(enrollment) {
  return {
    id: enrollment.id,
    student_id: enrollment.student?.id || null,
    course_id: enrollment.course?.id || null,
    data_regjistrimit: enrollment.data_regjistrimit,
    statusi: enrollment.statusi,
    nota: enrollment.nota,
    duration_months: enrollment.kohezgjatja_muaj,
    base_amount: enrollment.cmimi_baze,
    discount_percent: enrollment.zbritja_perqindje,
    final_amount: enrollment.cmimi_final,
    first_time_offer: Boolean(enrollment.oferta_fillestare),
    numri_studentit: enrollment.student?.numri_studentit || null,
    student_name: enrollment.student?.user?.username || null,
    student_email: enrollment.student?.user?.email || null,
    course_name: enrollment.course?.emertimi || null,
    kredite: enrollment.course?.kredite || null,
    professor_user_id: enrollment.course?.professor?.user?.id || null,
  };
}

function mapStudentEnrollment(enrollment) {
  const payment = enrollment.payments?.[0];

  return {
    id: enrollment.id,
    student_id: enrollment.student?.id || null,
    course_id: enrollment.course?.id || null,
    data_regjistrimit: enrollment.data_regjistrimit,
    statusi: enrollment.statusi,
    nota: enrollment.nota,
    duration_months: enrollment.kohezgjatja_muaj,
    base_amount: enrollment.cmimi_baze,
    discount_percent: enrollment.zbritja_perqindje,
    final_amount: enrollment.cmimi_final,
    first_time_offer: Boolean(enrollment.oferta_fillestare),
    course_name: enrollment.course?.emertimi || null,
    kredite: enrollment.course?.kredite || null,
    cmimi: enrollment.course?.cmimi || 0,
    professor_name: enrollment.course?.professor?.user?.username || null,
    payment_id: payment?.id || null,
    payment_status: payment?.statusi || null,
    paid_amount: payment?.amount || null,
    invoice_number: payment?.invoice_number || null,
    transaction_id: payment?.transaction_id || null,
    payment_method: payment?.payment_method || null,
    payment_date: payment?.data_pageses || null,
  };
}

function isDuplicateEnrollmentError(err) {
  return (
    err?.code === "ER_DUP_ENTRY" &&
    String(err.sqlMessage || err.message || "").includes(
      "uq_enrollments_student_course"
    )
  );
}

// GET all enrollments with student and course details
router.get("/", requireRole("admin", "professor"), async (req, res) => {
  try {
    const query = AppDataSource.getRepository("Enrollment")
      .createQueryBuilder("enrollment")
      .leftJoinAndSelect("enrollment.student", "student")
      .leftJoinAndSelect("student.user", "studentUser")
      .leftJoinAndSelect("enrollment.course", "course")
      .leftJoinAndSelect("course.professor", "professor")
      .leftJoinAndSelect("professor.user", "professorUser")
      .orderBy("enrollment.id", "DESC");

    if (req.user.role === "professor") {
      query.where("professorUser.id = :userId", { userId: req.user.id });
    }

    const enrollments = await query.getMany();
    res.json(enrollments.map(mapEnrollment));
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET logged-in student's own enrollments
router.get("/mine", requireRole("student"), async (req, res) => {
  try {
    const student = await getStudentForUser(req.user.id);

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const enrollments = await AppDataSource.getRepository("Enrollment").find({
      where: { student: { id: student.id } },
      relations: {
        course: {
          professor: {
            user: true,
          },
        },
        payments: true,
      },
      order: { id: "DESC" },
    });

    res.json(enrollments.map(mapStudentEnrollment));
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST enroll logged-in student in a course
router.post("/", requireRole("student"), async (req, res) => {
  const { course_id, duration_months } = req.body;

  if (!course_id) {
    return res.status(400).json({ message: "Course is required" });
  }

  const durationMonths = normalizeDurationMonths(duration_months);

  if (!durationMonths) {
    return res.status(400).json({
      message: `Duration must be one of these options: ${DURATION_OPTIONS.join(
        ", "
      )} months`,
    });
  }

  try {
    const enrollmentRepository = AppDataSource.getRepository("Enrollment");
    const courseRepository = AppDataSource.getRepository("Course");
    const student = await getStudentForUser(req.user.id);

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const existingEnrollment = await enrollmentRepository.findOne({
      where: {
        student: { id: student.id },
        course: { id: Number(course_id) },
      },
    });

    if (existingEnrollment) {
      return res.status(409).json({
        message: "You are already enrolled in this course",
      });
    }

    const course = await courseRepository.findOneBy({ id: Number(course_id) });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const enrolledCount = await enrollmentRepository.count({
      where: {
        course: { id: Number(course_id) },
        statusi: "active",
      },
    });
    const capacity = Number(course.kapaciteti || 0);

    if (capacity > 0 && enrolledCount >= capacity) {
      const waitingRepository = AppDataSource.getRepository("WaitingList");
      const existingWaitingListItem = await waitingRepository.findOne({
        where: {
          student: { id: student.id },
          course: { id: Number(course_id) },
        },
      });

      if (existingWaitingListItem) {
        return res.status(409).json({
          message: "Course is full and you are already on the waiting list",
        });
      }

      const pozicioni =
        (await waitingRepository.count({
          where: { course: { id: Number(course_id) } },
        })) + 1;

      const waitingListItem = await waitingRepository.save({
        student,
        course,
        data: new Date().toISOString().slice(0, 10),
        pozicioni,
        statusi: "waiting",
        prioriteti: "normal",
        njofto_me_email: true,
      });

      return res.status(202).json({
        message: `Course is full. You were added to the waiting list at position ${pozicioni}.`,
        waiting_list_id: waitingListItem.id,
        pozicioni,
      });
    }

    const existingStudentEnrollments = await enrollmentRepository.count({
      where: {
        student: { id: student.id },
      },
    });
    const pricing = calculateEnrollmentPricing(
      course,
      durationMonths,
      existingStudentEnrollments > 0
    );

    const enrollment = await enrollmentRepository.save({
      student,
      course,
      data_regjistrimit: new Date().toISOString().slice(0, 10),
      statusi: "active",
      kohezgjatja_muaj: durationMonths,
      cmimi_baze: pricing.baseAmount,
      zbritja_perqindje: pricing.discountPercent,
      cmimi_final: pricing.finalAmount,
      oferta_fillestare: pricing.isFirstTimeOffer,
    });

    res.status(201).json({
      message: "Enrollment created successfully",
      enrollment_id: enrollment.id,
      duration_months: durationMonths,
      base_amount: pricing.baseAmount,
      discount_percent: pricing.discountPercent,
      final_amount: pricing.finalAmount,
      first_time_offer: pricing.isFirstTimeOffer,
    });
  } catch (err) {
    if (isDuplicateEnrollmentError(err)) {
      return res.status(409).json({
        message: "You are already enrolled in this course",
      });
    }

    res.status(500).json(err);
  }
});

module.exports = router;
