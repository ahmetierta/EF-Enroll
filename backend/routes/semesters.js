const express = require("express");
const router = express.Router();
const AppDataSource = require("../data-source");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

router.use(authenticateToken);

// GET all semesters
router.get("/", requireRole("admin", "professor"), async (req, res) => {
  try {
    const semesterRepository = AppDataSource.getRepository("Semester");
    const semesters = await semesterRepository.find({
      order: { id: "DESC" },
    });

    res.json(semesters);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET semester by id
router.get("/:id", requireRole("admin", "professor"), async (req, res) => {
  try {
    const semesterRepository = AppDataSource.getRepository("Semester");
    const semester = await semesterRepository.findOneBy({
      id: Number(req.params.id),
    });

    res.json(semester ? [semester] : []);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST create semester
router.post("/", requireRole("admin"), async (req, res) => {
  const { emertimi, data_fillimit, data_perfundimit, statusi } = req.body;

  try {
    const semesterRepository = AppDataSource.getRepository("Semester");
    const semester = semesterRepository.create({
      emertimi,
      data_fillimit,
      data_perfundimit,
      statusi,
    });
    const result = await semesterRepository.save(semester);

    res.json({ message: "Semestri u shtua me sukses", result });
  } catch (err) {
    res.status(500).json(err);
  }
});

// PUT update semester
router.put("/:id", requireRole("admin"), async (req, res) => {
  const { emertimi, data_fillimit, data_perfundimit, statusi } = req.body;

  try {
    const semesterRepository = AppDataSource.getRepository("Semester");
    const result = await semesterRepository.update(Number(req.params.id), {
      emertimi,
      data_fillimit,
      data_perfundimit,
      statusi,
    });

    res.json({ message: "Semestri u perditesua me sukses", result });
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE semester
router.delete("/:id", requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await AppDataSource.transaction(async (manager) => {
      const assignedCourses = await manager.getRepository("Course").count({
        where: { semester: { id } },
      });

      if (assignedCourses > 0) {
        return { conflict: true, assignedCourses };
      }

      return manager.getRepository("Semester").delete(id);
    });

    if (result.conflict) {
      return res.status(409).json({
        message: "Semester has assigned courses and cannot be deleted",
        assigned_courses: result.assignedCourses,
      });
    }

    res.json({ message: "Semestri u fshi me sukses", result });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
