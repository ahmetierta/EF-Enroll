const express = require("express");
const router = express.Router();
const AppDataSource = require("../data-source");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

// GET all departments
router.get("/", async (req, res) => {
  try {
    const departmentRepository = AppDataSource.getRepository("Department");
    const departments = await departmentRepository.find({
      order: { id: "DESC" },
    });

    res.json(departments);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET department by id
router.get("/:id", async (req, res) => {
  try {
    const departmentRepository = AppDataSource.getRepository("Department");
    const department = await departmentRepository.findOneBy({
      id: Number(req.params.id),
    });

    res.json(department ? [department] : []);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST create department
router.post("/", authenticateToken, requireRole("admin"), async (req, res) => {
  const { emertimi, pershkrimi, shefi_departamentit } = req.body;

  try {
    const departmentRepository = AppDataSource.getRepository("Department");
    const department = departmentRepository.create({
      emertimi,
      pershkrimi,
      shefi_departamentit,
    });
    const result = await departmentRepository.save(department);

    res.json({ message: "Departamenti u shtua me sukses", result });
  } catch (err) {
    res.status(500).json(err);
  }
});

// PUT update department
router.put("/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  const { emertimi, pershkrimi, shefi_departamentit } = req.body;

  try {
    const departmentRepository = AppDataSource.getRepository("Department");
    const result = await departmentRepository.update(Number(req.params.id), {
      emertimi,
      pershkrimi,
      shefi_departamentit,
    });

    res.json({ message: "Departamenti u perditesua me sukses", result });
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE department
router.delete("/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const departmentRepository = AppDataSource.getRepository("Department");
    const result = await departmentRepository.delete(Number(req.params.id));

    res.json({ message: "Departamenti u fshi me sukses", result });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
