const express = require("express");
const router = express.Router();
const AppDataSource = require("../data-source");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");
const { calculateEnrollmentPricing } = require("../utils/pricing");

router.use(authenticateToken);

const WAITING_STATUSES = ["waiting", "notified", "paused"];
const WAITING_PRIORITIES = ["normal", "high"];

async function getStudentForUser(userId) {
  return AppDataSource.getRepository("Student").findOne({
    where: { user: { id: userId } },
  });
}

function mapWaitingListItem(item) {
  const course = item.course;
  const enrolledCount = Number(course?.enrolled_count || 0);
  const capacity = Number(course?.kapaciteti || 0);

  return {
    id: item.id,
    student_id: item.student?.id || null,
    course_id: course?.id || null,
    data: item.data,
    pozicioni: item.pozicioni,
    statusi: item.statusi || "waiting",
    prioriteti: item.prioriteti || "normal",
    arsyeja: item.arsyeja || null,
    njofto_me_email: Boolean(item.njofto_me_email),
    data_njoftimit: item.data_njoftimit || null,
    afati_pergjigjes: item.afati_pergjigjes || null,
    numri_studentit: item.student?.numri_studentit || null,
    student_name: item.student?.user?.username || null,
    student_email: item.student?.user?.email || null,
    course_name: course?.emertimi || null,
    kredite: course?.kredite || null,
    kapaciteti: capacity,
    enrolled_count: enrolledCount,
    available_seats: Math.max(capacity - enrolledCount, 0),
    estimated_wait_days:
      Math.max(capacity - enrolledCount, 0) > 0
        ? 0
        : Math.max(Number(item.pozicioni || 1) - 1, 0) * 7,
    professor_user_id: course?.professor?.user?.id || null,
    professor_name: course?.professor?.user?.username || null,
  };
}

async function getCourseAvailability(courseId, manager = AppDataSource.manager) {
  const courseRepository = manager.getRepository("Course");
  const enrollmentRepository = manager.getRepository("Enrollment");
  const course = await courseRepository.findOne({
    where: { id: Number(courseId) },
    relations: {
      professor: {
        user: true,
      },
    },
  });

  if (!course) {
    return null;
  }

  const enrolledCount = await enrollmentRepository.count({
    where: {
      course: { id: Number(courseId) },
      statusi: "active",
    },
  });
  const capacity = Number(course.kapaciteti || 0);

  return {
    course,
    enrolledCount,
    capacity,
    availableSeats: Math.max(capacity - enrolledCount, 0),
  };
}

async function reorderWaitingList(courseId, manager = AppDataSource.manager) {
  const waitingRepository = manager.getRepository("WaitingList");
  const entries = await waitingRepository.find({
    where: { course: { id: Number(courseId) } },
    order: { pozicioni: "ASC", id: "ASC" },
  });

  const reorderedEntries = entries.map((entry, index) => ({
    ...entry,
    pozicioni: index + 1,
  }));

  if (reorderedEntries.length) {
    await waitingRepository.save(reorderedEntries);
  }
}

function assertWaitingListAccess(req, item) {
  if (req.user.role === "admin") {
    return null;
  }

  if (
    req.user.role === "professor" &&
    item.course?.professor?.user?.id === req.user.id
  ) {
    return null;
  }

  if (req.user.role === "student" && item.student?.user?.id === req.user.id) {
    return null;
  }

  return { status: 403, message: "You cannot manage this waiting list item" };
}

router.get("/", requireRole("admin", "professor", "student"), async (req, res) => {
  try {
    const query = AppDataSource.getRepository("WaitingList")
      .createQueryBuilder("waiting")
      .leftJoinAndSelect("waiting.student", "student")
      .leftJoinAndSelect("student.user", "studentUser")
      .leftJoinAndSelect("waiting.course", "course")
      .leftJoinAndSelect("course.professor", "professor")
      .leftJoinAndSelect("professor.user", "professorUser")
      .loadRelationCountAndMap(
        "course.enrolled_count",
        "course.enrollments",
        "enrollment",
        (qb) => qb.andWhere("enrollment.statusi = :status", { status: "active" })
      )
      .orderBy("course.emertimi", "ASC")
      .addOrderBy("waiting.pozicioni", "ASC")
      .addOrderBy("waiting.id", "ASC");

    if (req.user.role === "professor") {
      query.where("professorUser.id = :userId", { userId: req.user.id });
    }

    if (req.user.role === "student") {
      query.where("studentUser.id = :userId", { userId: req.user.id });
    }

    const waitingList = await query.getMany();
    res.json(waitingList.map(mapWaitingListItem));
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/", requireRole("student"), async (req, res) => {
  const { course_id, arsyeja, njofto_me_email } = req.body;

  if (!course_id) {
    return res.status(400).json({ message: "Course is required" });
  }

  try {
    const waitingRepository = AppDataSource.getRepository("WaitingList");
    const enrollmentRepository = AppDataSource.getRepository("Enrollment");
    const student = await getStudentForUser(req.user.id);

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const availability = await getCourseAvailability(course_id);

    if (!availability) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (availability.capacity === 0 || availability.availableSeats > 0) {
      return res.status(409).json({
        message: "This course still has seats available. Enroll instead.",
      });
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

    const existingWaitingListItem = await waitingRepository.findOne({
      where: {
        student: { id: student.id },
        course: { id: Number(course_id) },
      },
    });

    if (existingWaitingListItem) {
      return res.status(409).json({
        message: "You are already on the waiting list for this course",
      });
    }

    const pozicioni =
      (await waitingRepository.count({
        where: { course: { id: Number(course_id) } },
      })) + 1;

    const waitingListItem = await waitingRepository.save({
      student,
      course: availability.course,
      data: new Date().toISOString().slice(0, 10),
      pozicioni,
      statusi: "waiting",
      prioriteti: "normal",
      arsyeja: arsyeja ? String(arsyeja).trim() : null,
      njofto_me_email: njofto_me_email !== false,
    });

    res.status(201).json({
      message: `Course is full. You were added to the waiting list at position ${pozicioni}.`,
      waiting_list_id: waitingListItem.id,
      pozicioni,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.patch("/:id", requireRole("admin", "professor", "student"), async (req, res) => {
  const id = Number(req.params.id);

  try {
    const waitingRepository = AppDataSource.getRepository("WaitingList");
    const item = await waitingRepository.findOne({
      where: { id },
      relations: {
        student: {
          user: true,
        },
        course: {
          professor: {
            user: true,
          },
        },
      },
    });

    if (!item) {
      return res.status(404).json({ message: "Waiting list item not found" });
    }

    const accessError = assertWaitingListAccess(req, item);

    if (accessError) {
      return res.status(accessError.status).json({ message: accessError.message });
    }

    if (req.body.statusi !== undefined) {
      if (!WAITING_STATUSES.includes(req.body.statusi)) {
        return res.status(400).json({ message: "Waiting list status is not supported" });
      }

      if (req.user.role === "student" && req.body.statusi !== item.statusi) {
        return res.status(403).json({
          message: "Students cannot change waiting list status",
        });
      }

      item.statusi = req.body.statusi;
    }

    if (req.body.prioriteti !== undefined) {
      if (!WAITING_PRIORITIES.includes(req.body.prioriteti)) {
        return res.status(400).json({ message: "Waiting list priority is not supported" });
      }

      if (req.user.role === "student") {
        return res.status(403).json({
          message: "Students cannot change waiting list priority",
        });
      }

      item.prioriteti = req.body.prioriteti;
    }

    if (req.body.arsyeja !== undefined) {
      item.arsyeja = req.body.arsyeja ? String(req.body.arsyeja).trim() : null;
    }

    if (req.body.njofto_me_email !== undefined) {
      item.njofto_me_email =
        req.body.njofto_me_email === true ||
        req.body.njofto_me_email === "true" ||
        req.body.njofto_me_email === 1 ||
        req.body.njofto_me_email === "1";
    }

    if (req.body.statusi === "notified") {
      item.data_njoftimit = new Date();
      item.afati_pergjigjes = new Date(Date.now() + 48 * 60 * 60 * 1000);
    }

    const savedItem = await waitingRepository.save(item);

    res.json({
      message: "Waiting list item updated successfully",
      item: mapWaitingListItem(savedItem),
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post(
  "/:id/promote",
  requireRole("admin", "professor"),
  async (req, res) => {
    const id = Number(req.params.id);

    try {
      const result = await AppDataSource.transaction(async (manager) => {
        const waitingRepository = manager.getRepository("WaitingList");
        const enrollmentRepository = manager.getRepository("Enrollment");
        const item = await waitingRepository.findOne({
          where: { id },
          relations: {
            student: {
              user: true,
            },
            course: {
              professor: {
                user: true,
              },
            },
          },
        });

        if (!item) {
          return { status: 404, body: { message: "Waiting list item not found" } };
        }

        const accessError = assertWaitingListAccess(req, item);

        if (accessError) {
          return {
            status: accessError.status,
            body: { message: accessError.message },
          };
        }

        const availability = await getCourseAvailability(item.course.id, manager);

        if (!availability || availability.availableSeats <= 0) {
          return {
            status: 409,
            body: { message: "No seats are available for this course yet" },
          };
        }

        const firstWaitingItem = await waitingRepository.findOne({
          where: { course: { id: item.course.id } },
          order: { pozicioni: "ASC", id: "ASC" },
        });

        if (firstWaitingItem && firstWaitingItem.id !== item.id) {
          return {
            status: 409,
            body: {
              message:
                "Only the first student in the waiting list can be promoted",
            },
          };
        }

        const existingEnrollment = await enrollmentRepository.findOne({
          where: {
            student: { id: item.student.id },
            course: { id: item.course.id },
          },
        });

        if (!existingEnrollment) {
          const existingStudentEnrollments = await enrollmentRepository.count({
            where: {
              student: { id: item.student.id },
            },
          });
          const durationMonths = 1;
          const pricing = calculateEnrollmentPricing(
            availability.course,
            durationMonths,
            existingStudentEnrollments > 0
          );

          await enrollmentRepository.save({
            student: item.student,
            course: item.course,
            data_regjistrimit: new Date().toISOString().slice(0, 10),
            statusi: "active",
            kohezgjatja_muaj: durationMonths,
            cmimi_baze: pricing.baseAmount,
            zbritja_perqindje: pricing.discountPercent,
            cmimi_final: pricing.finalAmount,
            oferta_fillestare: pricing.isFirstTimeOffer,
          });
        }

        const courseId = item.course.id;
        await waitingRepository.remove(item);
        await reorderWaitingList(courseId, manager);

        return {
          status: 201,
          body: { message: "Student promoted from waiting list successfully" },
        };
      });

      res.status(result.status).json(result.body);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

router.delete("/:id", requireRole("admin", "professor", "student"), async (req, res) => {
  const id = Number(req.params.id);

  try {
    const waitingRepository = AppDataSource.getRepository("WaitingList");
    const item = await waitingRepository.findOne({
      where: { id },
      relations: {
        student: {
          user: true,
        },
        course: {
          professor: {
            user: true,
          },
        },
      },
    });

    if (!item) {
      return res.status(404).json({ message: "Waiting list item not found" });
    }

    const accessError = assertWaitingListAccess(req, item);

    if (accessError) {
      return res.status(accessError.status).json({ message: accessError.message });
    }

    const courseId = item.course.id;
    await waitingRepository.remove(item);
    await reorderWaitingList(courseId);

    res.json({ message: "Waiting list item removed successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
