const express = require("express");
const router = express.Router();
const AppDataSource = require("../data-source");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

router.use(authenticateToken);

const MATERIAL_TYPES = [
  "video",
  "reading",
  "slides",
  "assignment",
  "quiz",
  "resource",
  "link",
];

function mapMaterial(material) {
  return {
    id: material.id,
    course_id: material.course?.id || null,
    professor_id: material.professor?.id || null,
    titulli: material.titulli,
    file_url: material.file_url,
    material_type: material.material_type || "resource",
    pershkrimi: material.pershkrimi || null,
    moduli: material.moduli || null,
    java: material.java || null,
    duration_minutes: Number(material.duration_minutes || 0),
    is_required: Boolean(material.is_required),
    order_index: Number(material.order_index || 0),
    data: material.data,
    course_name: material.course?.emertimi || null,
    professor_name: material.professor?.user?.username || null,
  };
}

function getBooleanValue(value, fallback = true) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return value === true || value === "true" || value === "1" || value === 1;
}

function buildMaterialPayload(body) {
  const materialType = body.material_type || "resource";

  if (!MATERIAL_TYPES.includes(materialType)) {
    return { error: "Material type is not supported" };
  }

  return {
    data: {
      titulli: String(body.titulli || "").trim(),
      file_url: String(body.file_url || "").trim(),
      material_type: materialType,
      pershkrimi: body.pershkrimi ? String(body.pershkrimi).trim() : null,
      moduli: body.moduli ? String(body.moduli).trim() : null,
      java: body.java ? Number(body.java) : null,
      duration_minutes: body.duration_minutes
        ? Number(body.duration_minutes)
        : 0,
      is_required: getBooleanValue(body.is_required, true),
      order_index: body.order_index ? Number(body.order_index) : 0,
    },
  };
}

async function getProfessorForUser(userId) {
  return AppDataSource.getRepository("Professor").findOne({
    where: { user: { id: userId } },
  });
}

async function assertProfessorOwnsCourse(req, courseId) {
  if (req.user.role === "admin") {
    return { ok: true, professor: null };
  }

  const professor = await getProfessorForUser(req.user.id);

  if (!professor) {
    return { ok: false, status: 404, message: "Professor profile not found" };
  }

  const course = await AppDataSource.getRepository("Course").findOne({
    where: {
      id: Number(courseId),
      professor: { id: professor.id },
    },
  });

  if (!course) {
    return {
      ok: false,
      status: 403,
      message: "You can only manage materials for your own courses",
    };
  }

  return { ok: true, professor };
}

router.get("/", requireRole("admin", "professor", "student"), async (req, res) => {
  try {
    const { course_id, material_type, required, search } = req.query;
    const query = AppDataSource.getRepository("CourseMaterial")
      .createQueryBuilder("material")
      .leftJoinAndSelect("material.course", "course")
      .leftJoinAndSelect("material.professor", "professor")
      .leftJoinAndSelect("professor.user", "user")
      .leftJoin("course.professor", "courseProfessor")
      .leftJoin("courseProfessor.user", "courseProfessorUser")
      .orderBy("course.emertimi", "ASC")
      .addOrderBy("material.order_index", "ASC")
      .addOrderBy("material.java", "ASC")
      .addOrderBy("material.id", "DESC");
    let hasWhere = false;

    const addCondition = (condition, params) => {
      if (hasWhere) {
        query.andWhere(condition, params);
      } else {
        query.where(condition, params);
        hasWhere = true;
      }
    };

    if (course_id) {
      addCondition("course.id = :courseId", { courseId: Number(course_id) });
    }

    if (material_type) {
      addCondition("material.material_type = :materialType", {
        materialType: String(material_type),
      });
    }

    if (required === "required") {
      addCondition("material.is_required = :isRequired", { isRequired: true });
    }

    if (required === "optional") {
      addCondition("material.is_required = :isRequired", { isRequired: false });
    }

    if (search) {
      addCondition(
        "(material.titulli LIKE :search OR material.pershkrimi LIKE :search OR material.moduli LIKE :search OR course.emertimi LIKE :search)",
        { search: `%${String(search).trim()}%` }
      );
    }

    if (req.user.role === "professor") {
      addCondition("courseProfessorUser.id = :userId", { userId: req.user.id });
    }

    if (req.user.role === "student") {
      query
        .innerJoin("course.enrollments", "enrollment")
        .innerJoin("enrollment.student", "student")
        .innerJoin("student.user", "studentUser");

      addCondition("studentUser.id = :userId", { userId: req.user.id });
      addCondition("enrollment.statusi = :status", { status: "active" });
    }

    const materials = await query.getMany();
    res.json(materials.map(mapMaterial));
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/", requireRole("professor"), async (req, res) => {
  const { course_id } = req.body;
  const payload = buildMaterialPayload(req.body);

  if (!course_id || !payload.data?.titulli || !payload.data?.file_url) {
    return res.status(400).json({
      message: "Course, title and file link are required",
    });
  }

  if (payload.error) {
    return res.status(400).json({ message: payload.error });
  }

  try {
    const access = await assertProfessorOwnsCourse(req, course_id);

    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    const material = await AppDataSource.getRepository("CourseMaterial").save({
      course: { id: Number(course_id) },
      professor: access.professor,
      ...payload.data,
    });

    res.status(201).json({
      message: "Material added successfully",
      material_id: material.id,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/:id", requireRole("admin", "professor"), async (req, res) => {
  const id = Number(req.params.id);
  const payload = buildMaterialPayload(req.body);

  if (!payload.data?.titulli || !payload.data?.file_url) {
    return res.status(400).json({
      message: "Title and file link are required",
    });
  }

  if (payload.error) {
    return res.status(400).json({ message: payload.error });
  }

  try {
    const materialRepository = AppDataSource.getRepository("CourseMaterial");
    const material = await materialRepository.findOne({
      where: { id },
      relations: {
        course: {
          professor: {
            user: true,
          },
        },
        professor: true,
      },
    });

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    const courseId = req.body.course_id || material.course?.id;
    const access = await assertProfessorOwnsCourse(req, courseId);

    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    materialRepository.merge(material, {
      course: { id: Number(courseId) },
      professor: req.user.role === "professor" ? access.professor : material.professor,
      ...payload.data,
    });

    const savedMaterial = await materialRepository.save(material);

    res.json({
      message: "Material updated successfully",
      material: mapMaterial(savedMaterial),
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/:id", requireRole("admin", "professor"), async (req, res) => {
  const id = Number(req.params.id);

  try {
    const materialRepository = AppDataSource.getRepository("CourseMaterial");
    const material = await materialRepository.findOne({
      where: { id },
      relations: {
        course: {
          professor: {
            user: true,
          },
        },
      },
    });

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    if (
      req.user.role === "professor" &&
      material.course?.professor?.user?.id !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only delete materials for your own courses",
      });
    }

    await materialRepository.remove(material);

    res.json({ message: "Material deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
