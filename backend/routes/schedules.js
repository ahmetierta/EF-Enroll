const express = require("express");
const router = express.Router();
const AppDataSource = require("../data-source");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

router.use(authenticateToken);

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

function normalizeTime(value) {
  const time = String(value || "").trim();

  if (!time) {
    return "";
  }

  return time.length === 5 ? `${time}:00` : time;
}

function normalizeSchedulePayload(body) {
  return {
    course_id: Number(body.course_id),
    dita: String(body.dita || "").trim(),
    ora_fillimit: normalizeTime(body.ora_fillimit),
    ora_perfundimit: normalizeTime(body.ora_perfundimit),
    salla: String(body.salla || "").trim(),
  };
}

function validateSchedulePayload(payload) {
  if (
    !payload.course_id ||
    !payload.dita ||
    !payload.ora_fillimit ||
    !payload.ora_perfundimit ||
    !payload.salla
  ) {
    return "All schedule fields are required.";
  }

  if (!Number.isInteger(payload.course_id) || payload.course_id <= 0) {
    return "Course id is not valid.";
  }

  if (!DAYS.includes(payload.dita)) {
    return "Schedule day is not supported.";
  }

  if (
    !TIME_PATTERN.test(payload.ora_fillimit) ||
    !TIME_PATTERN.test(payload.ora_perfundimit)
  ) {
    return "Schedule time must be in HH:mm format.";
  }

  if (payload.ora_perfundimit <= payload.ora_fillimit) {
    return "End time must be after start time.";
  }

  if (payload.salla.length > 50) {
    return "Room cannot be longer than 50 characters.";
  }

  return null;
}

async function getScheduleConflict(manager, payload, excludeId = null) {
  const courseRepository = manager.getRepository("Course");
  const scheduleRepository = manager.getRepository("Schedule");
  const course = await courseRepository.findOne({
    where: { id: payload.course_id },
    relations: { professor: true },
  });

  if (!course) {
    return { status: 404, message: "Course not found." };
  }

  const query = scheduleRepository
    .createQueryBuilder("schedule")
    .leftJoinAndSelect("schedule.course", "course")
    .leftJoinAndSelect("course.professor", "professor")
    .where("schedule.dita = :day", { day: payload.dita })
    .andWhere("schedule.ora_fillimit < :endTime", {
      endTime: payload.ora_perfundimit,
    })
    .andWhere("schedule.ora_perfundimit > :startTime", {
      startTime: payload.ora_fillimit,
    });

  if (excludeId) {
    query.andWhere("schedule.id != :excludeId", { excludeId });
  }

  const conflicts = await query.getMany();
  const roomConflict = conflicts.find(
    (schedule) =>
      String(schedule.salla || "").toLowerCase() === payload.salla.toLowerCase()
  );

  if (roomConflict) {
    return {
      status: 409,
      message: `${payload.salla} is already occupied at this time.`,
    };
  }

  const courseConflict = conflicts.find(
    (schedule) => schedule.course?.id === payload.course_id
  );

  if (courseConflict) {
    return {
      status: 409,
      message: "This course already has a schedule that overlaps this time.",
    };
  }

  const professorConflict = conflicts.find(
    (schedule) =>
      course.professor?.id && schedule.course?.professor?.id === course.professor.id
  );

  if (professorConflict) {
    return {
      status: 409,
      message: "The assigned professor already has another course at this time.",
    };
  }

  return { course };
}

function mapSchedule(schedule) {
  return {
    id: schedule.id,
    course_id: schedule.course?.id || null,
    dita: schedule.dita,
    ora_fillimit: schedule.ora_fillimit,
    ora_perfundimit: schedule.ora_perfundimit,
    salla: schedule.salla,
    course_name: schedule.course?.emertimi || null,
  };
}

// GET all schedules for admin, or only own course schedules for professor
router.get("/", requireRole("admin", "professor"), async (req, res) => {
  try {
    const query = AppDataSource.getRepository("Schedule")
      .createQueryBuilder("schedule")
      .leftJoinAndSelect("schedule.course", "course")
      .leftJoin("course.professor", "professor")
      .leftJoin("professor.user", "professorUser")
      .orderBy("schedule.id", "DESC");

    if (req.user.role === "professor") {
      query.where("professorUser.id = :userId", { userId: req.user.id });
    }

    const schedules = await query.getMany();

    res.json(schedules.map(mapSchedule));
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET schedule by id
router.get("/:id", requireRole("admin", "professor"), async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Schedule id is not valid." });
  }

  try {
    const query = AppDataSource.getRepository("Schedule")
      .createQueryBuilder("schedule")
      .leftJoinAndSelect("schedule.course", "course")
      .leftJoin("course.professor", "professor")
      .leftJoin("professor.user", "professorUser")
      .where("schedule.id = :id", { id });

    if (req.user.role === "professor") {
      query.andWhere("professorUser.id = :userId", { userId: req.user.id });
    }

    const schedule = await query.getOne();

    res.json(schedule ? [mapSchedule(schedule)] : []);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST create schedule
router.post("/", requireRole("admin"), async (req, res) => {
  const payload = normalizeSchedulePayload(req.body);
  const validationError = validateSchedulePayload(payload);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const conflict = await getScheduleConflict(AppDataSource.manager, payload);

    if (conflict.message) {
      return res.status(conflict.status).json({ message: conflict.message });
    }

    const scheduleRepository = AppDataSource.getRepository("Schedule");
    const schedule = scheduleRepository.create({
      course: conflict.course,
      dita: payload.dita,
      ora_fillimit: payload.ora_fillimit,
      ora_perfundimit: payload.ora_perfundimit,
      salla: payload.salla,
    });
    const result = await scheduleRepository.save(schedule);

    res.json({ message: "Schedule created successfully.", result });
  } catch (err) {
    res.status(500).json({
      message: "Failed to create schedule.",
      error: err.sqlMessage || err.message,
    });
  }
});

// PUT update schedule
router.put("/:id", requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  const payload = normalizeSchedulePayload(req.body);
  const validationError = validateSchedulePayload(payload);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Schedule id is not valid." });
  }

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const scheduleRepository = AppDataSource.getRepository("Schedule");
    const schedule = await scheduleRepository.findOneBy({
      id,
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    const conflict = await getScheduleConflict(AppDataSource.manager, payload, id);

    if (conflict.message) {
      return res.status(conflict.status).json({ message: conflict.message });
    }

    scheduleRepository.merge(schedule, {
      course: conflict.course,
      dita: payload.dita,
      ora_fillimit: payload.ora_fillimit,
      ora_perfundimit: payload.ora_perfundimit,
      salla: payload.salla,
    });
    const result = await scheduleRepository.save(schedule);

    res.json({ message: "Schedule updated successfully.", result });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update schedule.",
      error: err.sqlMessage || err.message,
    });
  }
});

// DELETE schedule
router.delete("/:id", requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Schedule id is not valid." });
  }

  try {
    const result = await AppDataSource.getRepository("Schedule").delete(id);

    if (!result.affected) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    res.json({ message: "Schedule deleted successfully.", result });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete schedule.",
      error: err.sqlMessage || err.message,
    });
  }
});

module.exports = router;
