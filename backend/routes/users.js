const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const AppDataSource = require("../data-source");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

router.use(authenticateToken);
router.use(requireRole("admin"));

function mapUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
    created_at: user.created_at,
  };
}

// GET all users
router.get("/", async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository("User");
    const users = await userRepository.find({
      order: { id: "DESC" },
    });

    res.json(users.map(mapUser));
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET user by id
router.get("/:id", async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository("User");
    const user = await userRepository.findOneBy({ id: Number(req.params.id) });

    res.json(user ? [mapUser(user)] : []);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST create user
router.post("/", async (req, res) => {
  const { username, email, password, password_hash, role, status } = req.body;
  const rawPassword = password || password_hash;

  if (!username || !email || !rawPassword) {
    return res.status(400).json({
      message: "Username, email and password are required",
    });
  }

  try {
    const userRepository = AppDataSource.getRepository("User");
    const user = userRepository.create({
      username,
      email,
      password_hash: bcrypt.hashSync(rawPassword, 10),
      role: role || "student",
      status: status || "pending",
    });
    const result = await userRepository.save(user);

    res.json({ message: "User u krijua me sukses", result: mapUser(result) });
  } catch (err) {
    res.status(500).json(err);
  }
});

// PUT update user
router.put("/:id", async (req, res) => {
  const { username, email, password, password_hash, role, status } = req.body;
  const rawPassword = password || password_hash;

  try {
    const userRepository = AppDataSource.getRepository("User");
    const updateData = {
      username,
      email,
    };

    if (rawPassword) {
      updateData.password_hash = bcrypt.hashSync(rawPassword, 10);
    }

    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const result = await userRepository.update(Number(req.params.id), updateData);

    res.json({ message: "User u perditesua me sukses", result });
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE user
router.delete("/:id", async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository("User");
    const result = await userRepository.delete(Number(req.params.id));

    res.json({ message: "User u fshi me sukses", result });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
