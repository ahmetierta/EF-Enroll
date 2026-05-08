const express = require("express");
const router = express.Router();
const AppDataSource = require("../data-source");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

router.use(authenticateToken);

function mapMaterial(material) {
  return {
    id: material.id,
    course_id: material.course?.id || null,
    professor_id: material.professor?.id || null,
    titulli: material.titulli,
    file_url: material.file_url,
    data: material.data,
    course_name: material.course?.emertimi || null,
    professor_name: material.professor?.user?.username || null,
  };
}

router.get("/", requireRole("admin", "professor", "student"), async (req, res) => {
  try {
    const { course_id } = req.query;
    const query = AppDataSource.getRepository("CourseMaterial")
      .createQueryBuilder("material")
      .leftJoinAndSelect("material.course", "course")
      .leftJoinAndSelect("material.professor", "professor")
      .leftJoinAndSelect("professor.user", "user")
      .orderBy("material.id", "DESC");

    if (course_id) {
      query.where("course.id = :courseId", { courseId: Number(course_id) });
    }

    if (req.user.role === "professor") {
      if (course_id) {
        query.andWhere("user.id = :userId", { userId: req.user.id });
      } else {
        query.where("user.id = :userId", { userId: req.user.id });
      }
    }

    const materials = await query.getMany();
    res.json(materials.map(mapMaterial));
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/", requireRole("professor"), async (req, res) => {
  const { course_id, titulli, file_url } = req.body;

  if (!course_id || !titulli || !file_url) {
    return res.status(400).json({
      message: "Course, title and file link are required",
    });
  }

  try {
    const courseRepository = AppDataSource.getRepository("Course");
    const materialRepository = AppDataSource.getRepository("CourseMaterial");
    const professorRepository = AppDataSource.getRepository("Professor");
    let professor = null;

    if (req.user.role === "professor") {
      professor = await professorRepository.findOne({
        where: { user: { id: req.user.id } },
      });

      if (!professor) {
        return res.status(404).json({ message: "Professor profile not found" });
      }

      const course = await courseRepository.findOne({
        where: {
          id: Number(course_id),
          professor: { id: professor.id },
        },
      });

      if (!course) {
        return res.status(403).json({
          message: "You can only add materials for your own courses",
        });
      }
    }

    const material = await materialRepository.save({
      course: { id: Number(course_id) },
      professor,
      titulli,
      file_url,
    });

    res.status(201).json({
      message: "Material added successfully",
      material_id: material.id,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
