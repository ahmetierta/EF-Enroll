const express = require("express");
const router = express.Router();
const AppDataSource = require("../data-source");
const {
  authenticateToken,
  optionalAuth,
  requireRole,
} = require("../middleware/authMiddleware");

function mapCourseResponse(course) {
  const enrolledCount = Number(course.enrolled_count || 0);
  const waitingCount = Number(course.waiting_count || 0);
  const capacity = Number(course.kapaciteti || 0);
  const schedules = [...(course.schedules || [])]
    .sort((a, b) => {
      const dayCompare = String(a.dita || "").localeCompare(String(b.dita || ""));

      if (dayCompare !== 0) {
        return dayCompare;
      }

      return String(a.ora_fillimit || "").localeCompare(
        String(b.ora_fillimit || "")
      );
    })
    .map((schedule) => ({
      id: schedule.id,
      dita: schedule.dita,
      ora_fillimit: schedule.ora_fillimit,
      ora_perfundimit: schedule.ora_perfundimit,
      salla: schedule.salla,
    }));
  const scheduleSummary = schedules.length
    ? schedules
        .map(
          (schedule) =>
            `${schedule.dita || ""} ${String(schedule.ora_fillimit || "").slice(
              0,
              5
            )}-${String(schedule.ora_perfundimit || "").slice(0, 5)}${
              schedule.salla ? `, ${schedule.salla}` : ""
            }`.trim()
        )
        .join("; ")
    : null;

  return {
    id: course.id,
    emertimi: course.emertimi,
    pershkrimi: course.pershkrimi,
    kredite: course.kredite,
    professor_id: course.professor?.id || null,
    semester_id: course.semester?.id || null,
    kapaciteti: capacity,
    cmimi: course.cmimi,
    enrolled_count: enrolledCount,
    available_seats: Math.max(capacity - enrolledCount, 0),
    waiting_count: waitingCount,
    titulli: course.professor?.titulli || null,
    professor_name: course.professor?.user?.username || null,
    semester_name: course.semester?.emertimi || null,
    schedules,
    schedule_summary: scheduleSummary,
  };
}

function buildCourseQuery() {
  return AppDataSource.getRepository("Course")
    .createQueryBuilder("course")
    .leftJoinAndSelect("course.professor", "professor")
    .leftJoinAndSelect("professor.user", "user")
    .leftJoinAndSelect("course.semester", "semester")
    .leftJoinAndSelect("course.schedules", "schedule")
    .loadRelationCountAndMap(
      "course.enrolled_count",
      "course.enrollments",
      "enrollment",
      (qb) => qb.andWhere("enrollment.statusi = :status", { status: "active" })
    )
    .loadRelationCountAndMap("course.waiting_count", "course.waitingListItems");
}

async function validateCoursePayload({
  emertimi,
  kredite,
  professor_id,
  semester_id,
  kapaciteti,
}) {
  if (!emertimi || !String(emertimi).trim()) {
    return { status: 400, message: "Course name is required" };
  }

  if (!kredite || Number(kredite) <= 0) {
    return { status: 400, message: "Credits must be greater than 0" };
  }

  if (!kapaciteti || Number(kapaciteti) <= 0) {
    return { status: 400, message: "Capacity must be greater than 0" };
  }

  if (!professor_id) {
    return { status: 400, message: "Professor is required" };
  }

  if (!semester_id) {
    return { status: 400, message: "Semester is required" };
  }

  const professor = await AppDataSource.getRepository("Professor")
    .createQueryBuilder("professor")
    .leftJoinAndSelect("professor.user", "user")
    .where("professor.id = :id", { id: Number(professor_id) })
    .andWhere("user.status = :status", { status: "approved" })
    .getOne();

  if (!professor) {
    return {
      status: 400,
      message: "Selected professor does not exist or is not approved",
    };
  }

  const semester = await AppDataSource.getRepository("Semester").findOneBy({
    id: Number(semester_id),
  });

  if (!semester) {
    return { status: 400, message: "Selected semester does not exist" };
  }

  return null;
}

// GET all courses with professor and semester info
router.get("/", optionalAuth, async (req, res) => {
  try {
    const query = buildCourseQuery()
      .orderBy("course.id", "DESC")
      .addOrderBy("schedule.dita", "ASC")
      .addOrderBy("schedule.ora_fillimit", "ASC");

    if (req.user?.role === "professor") {
      query.where("user.id = :userId", { userId: req.user.id });
    }

    const courses = await query.getMany();
    res.json(courses.map(mapCourseResponse));
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET course by id with professor and semester info
router.get("/:id", optionalAuth, async (req, res) => {
  const id = req.params.id;

  try {
    const query = buildCourseQuery()
      .where("course.id = :id", { id })
      .addOrderBy("schedule.dita", "ASC")
      .addOrderBy("schedule.ora_fillimit", "ASC");

    if (req.user?.role === "professor") {
      query.andWhere("user.id = :userId", { userId: req.user.id });
    }

    const course = await query.getOne();
    res.json(course ? [mapCourseResponse(course)] : []);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST create course
router.post("/", authenticateToken, requireRole("admin"), async (req, res) => {
  const {
    emertimi,
    pershkrimi,
    kredite,
    professor_id,
    semester_id,
    kapaciteti,
    cmimi,
  } = req.body;

  try {
    const validationError = await validateCoursePayload(req.body);

    if (validationError) {
      return res
        .status(validationError.status)
        .json({ message: validationError.message });
    }

    const courseRepository = AppDataSource.getRepository("Course");
    const course = courseRepository.create({
      emertimi: String(emertimi).trim(),
      pershkrimi,
      kredite: Number(kredite),
      kapaciteti: Number(kapaciteti),
      cmimi: Number(cmimi || 0),
      professor: { id: Number(professor_id) },
      semester: { id: Number(semester_id) },
    });

    const savedCourse = await courseRepository.save(course);
    res.json({ message: "Kursi u shtua me sukses", result: savedCourse });
  } catch (err) {
    res.status(500).json({
      message: "Failed to add course",
      error: err.sqlMessage || err.message,
    });
  }
});

// PUT update course
router.put("/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  const id = req.params.id;
  const {
    emertimi,
    pershkrimi,
    kredite,
    professor_id,
    semester_id,
    kapaciteti,
    cmimi,
  } = req.body;

  try {
    const validationError = await validateCoursePayload(req.body);

    if (validationError) {
      return res
        .status(validationError.status)
        .json({ message: validationError.message });
    }

    const courseRepository = AppDataSource.getRepository("Course");
    const course = await courseRepository.findOneBy({ id });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    courseRepository.merge(course, {
      emertimi: String(emertimi).trim(),
      pershkrimi,
      kredite: Number(kredite),
      kapaciteti: Number(kapaciteti),
      cmimi: Number(cmimi || 0),
      professor: { id: Number(professor_id) },
      semester: { id: Number(semester_id) },
    });

    const savedCourse = await courseRepository.save(course);
    res.json({ message: "Kursi u perditesua me sukses", result: savedCourse });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update course",
      error: err.sqlMessage || err.message,
    });
  }
});

// DELETE course
router.delete("/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await AppDataSource.transaction(async (manager) => {
      const course = await manager.getRepository("Course").findOneBy({ id });

      if (!course) {
        return null;
      }

      await manager.query(
        "DELETE p FROM payments p INNER JOIN enrollments e ON e.id = p.enrollment_id WHERE e.course_id = ?",
        [id]
      );
      await manager.query("DELETE FROM enrollments WHERE course_id = ?", [id]);
      await manager.query("DELETE FROM schedules WHERE course_id = ?", [id]);
      await manager.query("DELETE FROM waiting_list WHERE course_id = ?", [id]);
      await manager.query("DELETE FROM announcements WHERE course_id = ?", [id]);
      await manager.query("DELETE FROM course_materials WHERE course_id = ?", [id]);

      return manager.getRepository("Course").delete(id);
    });

    if (!result) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ message: "Kursi u fshi me sukses", result });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete course",
      error: err.sqlMessage || err.message,
    });
  }
});

module.exports = router;
