const express = require("express");
const router = express.Router();
const AppDataSource = require("../data-source");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

router.use(authenticateToken);

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
    const announcements = await AppDataSource.getRepository("Announcement").find({
      relations: {
        course: true,
        professor: {
          user: true,
        },
      },
      order: { id: "DESC" },
    });

    res.json(announcements.map(mapAnnouncement));
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/", requireRole("admin", "professor"), async (req, res) => {
  const { course_id, titulli, permbajtja } = req.body;

  if (!course_id || !titulli || !permbajtja) {
    return res.status(400).json({ message: "Course, title and comment are required" });
  }

  try {
    const courseRepository = AppDataSource.getRepository("Course");
    const announcementRepository = AppDataSource.getRepository("Announcement");
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
          message: "You can only add comments for your own courses",
        });
      }
    }

    const announcement = await announcementRepository.save({
      course: { id: Number(course_id) },
      titulli,
      permbajtja,
      data: new Date().toISOString().slice(0, 10),
      professor,
    });

    res.status(201).json({
      message: "Announcement created successfully",
      announcement_id: announcement.id,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
