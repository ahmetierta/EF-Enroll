const express = require("express");
const router = express.Router();
const AppDataSource = require("../data-source");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

function normalizeDepartmentPayload(body) {
  return {
    emertimi: String(body.emertimi || "").trim(),
    pershkrimi: String(body.pershkrimi || "").trim(),
    shefi_departamentit: String(body.shefi_departamentit || "").trim(),
  };
}

function validateDepartmentPayload(payload) {
  if (!payload.emertimi || !payload.pershkrimi || !payload.shefi_departamentit) {
    return "Department name, description and head are required";
  }

  if (payload.emertimi.length > 150) {
    return "Department name cannot be longer than 150 characters";
  }

  if (payload.shefi_departamentit.length > 150) {
    return "Head of department cannot be longer than 150 characters";
  }

  return null;
}

async function findDepartmentByName(repository, name, excludeId = null) {
  const query = repository
    .createQueryBuilder("department")
    .where("LOWER(department.emertimi) = LOWER(:name)", { name });

  if (excludeId) {
    query.andWhere("department.id != :excludeId", { excludeId });
  }

  return query.getOne();
}

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
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Department id is not valid" });
  }

  try {
    const departmentRepository = AppDataSource.getRepository("Department");
    const department = await departmentRepository.findOneBy({
      id,
    });

    res.json(department ? [department] : []);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST create department
router.post("/", authenticateToken, requireRole("admin"), async (req, res) => {
  const payload = normalizeDepartmentPayload(req.body);
  const validationError = validateDepartmentPayload(payload);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const departmentRepository = AppDataSource.getRepository("Department");
    const existingDepartment = await findDepartmentByName(
      departmentRepository,
      payload.emertimi
    );

    if (existingDepartment) {
      return res.status(409).json({
        message: "A department with this name already exists",
      });
    }

    const department = departmentRepository.create(payload);
    const result = await departmentRepository.save(department);

    res.json({ message: "Departamenti u shtua me sukses", result });
  } catch (err) {
    res.status(500).json(err);
  }
});

// PUT update department
router.put("/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  const payload = normalizeDepartmentPayload(req.body);
  const validationError = validateDepartmentPayload(payload);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Department id is not valid" });
  }

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const departmentRepository = AppDataSource.getRepository("Department");
    const existingDepartment = await departmentRepository.findOneBy({ id });

    if (!existingDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }

    const duplicateDepartment = await findDepartmentByName(
      departmentRepository,
      payload.emertimi,
      id
    );

    if (duplicateDepartment) {
      return res.status(409).json({
        message: "A department with this name already exists",
      });
    }

    const result = await departmentRepository.update(id, payload);

    res.json({ message: "Departamenti u perditesua me sukses", result });
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE department
router.delete("/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Department id is not valid" });
  }

  try {
    const departmentRepository = AppDataSource.getRepository("Department");
    const result = await departmentRepository.delete(id);

    if (!result.affected) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json({ message: "Departamenti u fshi me sukses", result });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
