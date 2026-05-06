const express = require("express");
const router = express.Router();
const AppDataSource = require("../data-source");

function mapProfessor(professor) {
  return {
    id: professor.id,
    user_id: professor.user?.id || null,
    titulli: professor.titulli,
    departamenti: professor.departamenti,
    username: professor.user?.username || null,
    email: professor.user?.email || null,
  };
}

// GET all professors with user info
router.get("/", async (req, res) => {
  try {
    const professors = await AppDataSource.getRepository("Professor").find({
      relations: { user: true },
      order: { id: "DESC" },
    });

    res.json(professors.map(mapProfessor));
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET professor by id with user info
router.get("/:id", async (req, res) => {
  try {
    const professor = await AppDataSource.getRepository("Professor").findOne({
      where: { id: Number(req.params.id) },
      relations: { user: true },
    });

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
