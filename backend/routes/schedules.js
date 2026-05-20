const express = require("express");
const router = express.Router();
const AppDataSource = require("../data-source");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

router.use(authenticateToken);

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
  try {
    const query = AppDataSource.getRepository("Schedule")
      .createQueryBuilder("schedule")
      .leftJoinAndSelect("schedule.course", "course")
      .leftJoin("course.professor", "professor")
      .leftJoin("professor.user", "professorUser")
      .where("schedule.id = :id", { id: Number(req.params.id) });

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
  const { course_id, dita, ora_fillimit, ora_perfundimit, salla } = req.body;

  if (!course_id || !dita || !ora_fillimit || !ora_perfundimit || !salla) {
    return res.status(400).json({
      message: "All schedule fields are required.",
    });
  }

  try {
    const scheduleRepository = AppDataSource.getRepository("Schedule");
    const schedule = scheduleRepository.create({
      course: { id: course_id },
      dita,
      ora_fillimit,
      ora_perfundimit,
      salla,
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
  const { course_id, dita, ora_fillimit, ora_perfundimit, salla } = req.body;

  if (!course_id || !dita || !ora_fillimit || !ora_perfundimit || !salla) {
    return res.status(400).json({
      message: "All schedule fields are required.",
    });
  }

  try {
    const scheduleRepository = AppDataSource.getRepository("Schedule");
    const schedule = await scheduleRepository.findOneBy({
      id: Number(req.params.id),
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    scheduleRepository.merge(schedule, {
      course: { id: course_id },
      dita,
      ora_fillimit,
      ora_perfundimit,
      salla,
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
  try {
    const result = await AppDataSource.getRepository("Schedule").delete(
      Number(req.params.id)
    );

    res.json({ message: "Schedule deleted successfully.", result });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete schedule.",
      error: err.sqlMessage || err.message,
    });
  }
});

module.exports = router;
