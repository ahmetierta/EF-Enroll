const express = require("express");
const router = express.Router();
const AppDataSource = require("../data-source");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

router.use(authenticateToken);

function normalizeAnnouncementPayload(body) {
  return {
    course_id: Number(body.course_id),
    titulli: String(body.titulli || "").trim(),
    permbajtja: String(body.permbajtja || "").trim(),
  };
}

function validateAnnouncementPayload(payload) {
  if (!payload.course_id || !payload.titulli || !payload.permbajtja) {
    return "Course, title and announcement are required";
  }

  if (!Number.isInteger(payload.course_id) || payload.course_id <= 0) {
    return "Course id is not valid";
  }

  if (payload.titulli.length > 200) {
    return "Announcement title cannot be longer than 200 characters";
  }

  return null;
}

async function getProfessorProfile(userId) {
  return AppDataSource.getRepository("Professor").findOne({
    where: { user: { id: userId } },
    relations: { user: true },
  });
}

async function getAccessibleCourse(courseId, req, professor = null) {
  const courseRepository = AppDataSource.getRepository("Course");
  const query = courseRepository
    .createQueryBuilder("course")
    .leftJoinAndSelect("course.professor", "professor")
    .leftJoinAndSelect("professor.user", "user")
    .where("course.id = :courseId", { courseId });

  if (req.user.role === "professor") {
    query.andWhere("professor.id = :professorId", {
      professorId: professor?.id,
    });
  }

  return query.getOne();
}

function canManageAnnouncement(req, announcement) {
  if (req.user.role === "admin") {
    return true;
  }

  return announcement.professor?.user?.id === req.user.id;
}

function mapAnnouncement(announcement) {
  return {
    id: announcement.id,
    course_id: announcement.course?.id || null,
    titulli: announcement.titulli,
    permbajtja: announcement.permbajtja,
    data: announcement.data,
    professor_id: announcement.professor?.id || null,
    course_name: announcement.course?.emertimi || null,
    professor_name: announcement.professor?.user?.username || null,
  };
}

router.get("/", requireRole("admin", "professor", "student"), async (req, res) => {
  try {
    const query = AppDataSource.getRepository("Announcement")
      .createQueryBuilder("announcement")
      .leftJoinAndSelect("announcement.course", "course")
      .leftJoinAndSelect("announcement.professor", "professor")
      .leftJoinAndSelect("professor.user", "user")
      .leftJoin("course.professor", "courseProfessor")
      .leftJoin("courseProfessor.user", "courseProfessorUser")
      .orderBy("announcement.id", "DESC");
    let hasWhere = false;

    const addCondition = (condition, params) => {
      if (hasWhere) {
        query.andWhere(condition, params);
      } else {
        query.where(condition, params);
        hasWhere = true;
      }
    };

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

    const announcements = await query.getMany();

    res.json(announcements.map(mapAnnouncement));
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/", requireRole("admin", "professor"), async (req, res) => {
  const payload = normalizeAnnouncementPayload(req.body);
  const validationError = validateAnnouncementPayload(payload);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const announcementRepository = AppDataSource.getRepository("Announcement");
    let professor = null;

    if (req.user.role === "professor") {
      professor = await getProfessorProfile(req.user.id);

      if (!professor) {
        return res.status(404).json({ message: "Professor profile not found" });
      }
    }

    const course = await getAccessibleCourse(payload.course_id, req, professor);

    if (!course) {
      return res.status(req.user.role === "professor" ? 403 : 404).json({
        message:
          req.user.role === "professor"
            ? "You can only add announcements for your own courses"
            : "Course not found",
      });
    }

    const announcementProfessor = professor || course.professor;

    if (!announcementProfessor) {
      return res.status(400).json({ message: "Course must have a professor" });
    }

    const announcement = await announcementRepository.save({
      course,
      titulli: payload.titulli,
      permbajtja: payload.permbajtja,
      data: new Date().toISOString().slice(0, 10),
      professor: announcementProfessor,
    });

    res.status(201).json({
      message: "Announcement created successfully",
      announcement_id: announcement.id,
    });
  } catch (err) {
    res.status(500).json({
      message: "Announcement could not be created",
      error: err.sqlMessage || err.message,
    });
  }
});

router.put("/:id", requireRole("admin", "professor"), async (req, res) => {
  const id = Number(req.params.id);
  const payload = normalizeAnnouncementPayload(req.body);
  const validationError = validateAnnouncementPayload(payload);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Announcement id is not valid" });
  }

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const announcementRepository = AppDataSource.getRepository("Announcement");
    let professor = null;

    const announcement = await announcementRepository.findOne({
      where: { id },
      relations: {
        course: {
          professor: {
            user: true,
          },
        },
        professor: {
          user: true,
        },
      },
    });

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (!canManageAnnouncement(req, announcement)) {
      return res.status(403).json({
        message: "You can only update announcements that you created",
      });
    }

    if (req.user.role === "professor") {
      professor = await getProfessorProfile(req.user.id);
    }

    const course = await getAccessibleCourse(payload.course_id, req, professor);

    if (!course) {
      return res.status(req.user.role === "professor" ? 403 : 404).json({
        message:
          req.user.role === "professor"
            ? "You can only move announcements to your own courses"
            : "Course not found",
      });
    }

    announcementRepository.merge(announcement, {
      course,
      professor: professor || course.professor,
      titulli: payload.titulli,
      permbajtja: payload.permbajtja,
    });

    const result = await announcementRepository.save(announcement);

    res.json({
      message: "Announcement updated successfully",
      result: mapAnnouncement(result),
    });
  } catch (err) {
    res.status(500).json({
      message: "Announcement could not be updated",
      error: err.sqlMessage || err.message,
    });
  }
});

router.delete("/:id", requireRole("admin", "professor"), async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Announcement id is not valid" });
  }

  try {
    const announcementRepository = AppDataSource.getRepository("Announcement");
    const announcement = await announcementRepository.findOne({
      where: { id },
      relations: {
        professor: {
          user: true,
        },
      },
    });

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (!canManageAnnouncement(req, announcement)) {
      return res.status(403).json({
        message: "You can only delete announcements that you created",
      });
    }

    await announcementRepository.remove(announcement);

    res.json({ message: "Announcement deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Announcement could not be deleted",
      error: err.sqlMessage || err.message,
    });
  }
});

module.exports = router;
