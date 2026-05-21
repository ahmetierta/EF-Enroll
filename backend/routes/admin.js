const express = require("express");
const AppDataSource = require("../data-source");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");
const { getAdminDashboardSummary } = require("../services/adminAnalyticsService");

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole("admin"));

router.get("/dashboard-summary", async (req, res) => {
  try {
    const summary = await getAdminDashboardSummary(AppDataSource.manager);
    res.json(summary);
  } catch (err) {
    res.status(500).json({
      message: "Dashboard summary could not be loaded",
      error: err.message,
    });
  }
});

router.get("/pending-professors", async (req, res) => {
  try {
    const professorRepository = AppDataSource.getRepository("Professor");
    const professors = await professorRepository
      .createQueryBuilder("professor")
      .innerJoinAndSelect("professor.user", "user")
      .where("user.role = :role", { role: "professor" })
      .andWhere("user.status = :status", { status: "pending" })
      .orderBy("user.created_at", "DESC")
      .getMany();

    const result = professors.map((professor) => ({
      user_id: professor.user.id,
      username: professor.user.username,
      email: professor.user.email,
      role: professor.user.role,
      status: professor.user.status,
      created_at: professor.user.created_at,
      professor_id: professor.id,
      titulli: professor.titulli,
      departamenti: professor.departamenti,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/users/:id/approve", async (req, res) => {
  const userId = req.params.id;

  try {
    const userRepository = AppDataSource.getRepository("User");
    const result = await userRepository.update(
      { id: userId, role: "professor" },
      { status: "approved" }
    );

    if (result.affected === 0) {
      return res.status(404).json({ message: "Professor account not found" });
    }

    res.json({ message: "Professor account approved" });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/users/:id/reject", async (req, res) => {
  const userId = req.params.id;

  try {
    const userRepository = AppDataSource.getRepository("User");
    const result = await userRepository.update(
      { id: userId, role: "professor" },
      { status: "rejected" }
    );

    if (result.affected === 0) {
      return res.status(404).json({ message: "Professor account not found" });
    }

    res.json({ message: "Professor account rejected" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
