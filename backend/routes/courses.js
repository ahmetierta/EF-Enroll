const express = require("express");
const router = express.Router();
const AppDataSource = require("../data-source");
const {
  authenticateToken,
  optionalAuth,
  requireRole,
} = require("../middleware/authMiddleware");

function mapCourseResponse(course) {
  return {
    id: course.id,
    emertimi: course.emertimi,
    pershkrimi: course.pershkrimi,
    kredite: course.kredite,
    professor_id: course.professor?.id || null,
    semester_id: course.semester?.id || null,
    kapaciteti: course.kapaciteti,
    cmimi: course.cmimi,
    titulli: course.professor?.titulli || null,
    professor_name: course.professor?.user?.username || null,
    semester_name: course.semester?.emertimi || null,
  };
}

function buildCourseQuery() {
  return AppDataSource.getRepository("Course")
    .createQueryBuilder("course")
    .leftJoinAndSelect("course.professor", "professor")
    .leftJoinAndSelect("professor.user", "user")
    .leftJoinAndSelect("course.semester", "semester");
}

// GET all courses with professor and semester info
router.get("/", optionalAuth, async (req, res) => {
  try {
    const query = buildCourseQuery().orderBy("course.id", "DESC");

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
    const query = buildCourseQuery().where("course.id = :id", { id });

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
    const courseRepository = AppDataSource.getRepository("Course");
    const course = courseRepository.create({
      emertimi,
      pershkrimi,
      kredite,
      kapaciteti,
      cmimi: cmimi || 0,
      professor: professor_id ? { id: professor_id } : null,
      semester: semester_id ? { id: semester_id } : null,
    });

    const savedCourse = await courseRepository.save(course);
    res.json({ message: "Kursi u shtua me sukses", result: savedCourse });
  } catch (err) {
    res.status(500).json(err);
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
    const courseRepository = AppDataSource.getRepository("Course");
    const course = await courseRepository.findOneBy({ id });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    courseRepository.merge(course, {
      emertimi,
      pershkrimi,
      kredite,
      kapaciteti,
      cmimi: cmimi || 0,
      professor: professor_id ? { id: professor_id } : null,
      semester: semester_id ? { id: semester_id } : null,
    });

    const savedCourse = await courseRepository.save(course);
    res.json({ message: "Kursi u perditesua me sukses", result: savedCourse });
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE course
router.delete("/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  const id = req.params.id;

  try {
    const courseRepository = AppDataSource.getRepository("Course");
    const result = await courseRepository.delete(id);

    res.json({ message: "Kursi u fshi me sukses", result });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
