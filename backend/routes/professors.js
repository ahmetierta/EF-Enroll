const express = require("express");
const router = express.Router();
const AppDataSource = require("../data-source");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

router.use(authenticateToken);
router.use(requireRole("admin"));

function mapProfessor(professor) {
  const scheduledCourses = (professor.courses || [])
    .filter((course) => course.schedules?.length)
    .map((course) => ({
      id: course.id,
      emertimi: course.emertimi,
      cmimi: course.cmimi,
      schedules: [...course.schedules]
        .sort((a, b) => {
          const dayCompare = String(a.dita || "").localeCompare(
            String(b.dita || "")
          );

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
        })),
    }));

  return {
    id: professor.id,
    user_id: professor.user?.id || null,
    titulli: professor.titulli,
    departamenti: professor.departamenti,
    username: professor.user?.username || null,
    email: professor.user?.email || null,
    status: professor.user?.status || null,
    scheduled_courses: scheduledCourses,
  };
}

// GET approved professors with user info
router.get("/", async (req, res) => {
  try {
    const professors = await AppDataSource.getRepository("Professor")
      .createQueryBuilder("professor")
      .leftJoinAndSelect("professor.user", "user")
      .leftJoinAndSelect("professor.courses", "course")
      .leftJoinAndSelect("course.schedules", "schedule")
      .where("user.status = :status", { status: "approved" })
      .orderBy("professor.id", "DESC")
      .addOrderBy("course.emertimi", "ASC")
      .addOrderBy("schedule.dita", "ASC")
      .addOrderBy("schedule.ora_fillimit", "ASC")
      .getMany();

    res.json(professors.map(mapProfessor));
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET approved professor by id with user info
router.get("/:id", async (req, res) => {
  try {
    const professor = await AppDataSource.getRepository("Professor")
      .createQueryBuilder("professor")
      .leftJoinAndSelect("professor.user", "user")
      .leftJoinAndSelect("professor.courses", "course")
      .leftJoinAndSelect("course.schedules", "schedule")
      .where("professor.id = :id", { id: Number(req.params.id) })
      .andWhere("user.status = :status", { status: "approved" })
      .addOrderBy("course.emertimi", "ASC")
      .addOrderBy("schedule.dita", "ASC")
      .addOrderBy("schedule.ora_fillimit", "ASC")
      .getOne();

    res.json(professor ? [mapProfessor(professor)] : []);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST create user + professor
router.post("/", (req, res) => {
  res.status(405).json({
    message:
      "Professor accounts must be created from professor registration and approved by an admin.",
  });
});

// PUT update user + professor
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { username, email, titulli, departamenti } = req.body;

  try {
    const result = await AppDataSource.transaction(async (manager) => {
      const professorRepository = manager.getRepository("Professor");
      const userRepository = manager.getRepository("User");
      const professor = await professorRepository.findOne({
        where: { id },
        relations: { user: true },
      });

      if (!professor) {
        return null;
      }

      const userResult = await userRepository.update(professor.user.id, {
        username,
        email,
      });
      const professorResult = await professorRepository.update(id, {
        titulli,
        departamenti,
      });

      return { userResult, professorResult };
    });

    if (!result) {
      return res.status(404).json({ message: "Profesori nuk u gjet" });
    }

    res.json({
      message: "User dhe profesori u perditesuan me sukses",
      ...result,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE professor + user
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await AppDataSource.transaction(async (manager) => {
      const professorRepository = manager.getRepository("Professor");
      const userRepository = manager.getRepository("User");
      const professor = await professorRepository.findOne({
        where: { id },
        relations: { user: true },
      });

      if (!professor) {
        return null;
      }

      await manager
        .createQueryBuilder()
        .update("Course")
        .set({ professor: null })
        .where("professor_id = :id", { id })
        .execute();
      await manager
        .createQueryBuilder()
        .update("Announcement")
        .set({ professor: null })
        .where("professor_id = :id", { id })
        .execute();
      await manager
        .createQueryBuilder()
        .update("CourseMaterial")
        .set({ professor: null })
        .where("professor_id = :id", { id })
        .execute();

      const userId = professor.user?.id;
      const professorResult = await professorRepository.delete(id);
      const userResult = userId ? await userRepository.delete(userId) : null;

      return { professorResult, userResult };
    });

    if (!result) {
      return res.status(404).json({ message: "Profesori nuk u gjet" });
    }

    res.json({
      message: "Profesori dhe user-i u fshine me sukses",
      ...result,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
