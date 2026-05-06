const express = require("express");
const router = express.Router();
const AppDataSource = require("../data-source");

// GET all users
router.get("/", async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository("User");
    const users = await userRepository.find({
      order: { id: "DESC" },
    });

    res.json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET user by id
router.get("/:id", async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository("User");
    const user = await userRepository.findOneBy({ id: Number(req.params.id) });

    res.json(user ? [user] : []);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST create user
router.post("/", async (req, res) => {
  const { username, email, password_hash, role, status } = req.body;

  try {
    const userRepository = AppDataSource.getRepository("User");
    const user = userRepository.create({
      username,
      email,
      password_hash,
      role: role || "student",
      status: status || "pending",
    });
    const result = await userRepository.save(user);

    res.json({ message: "User u krijua me sukses", result });
  } catch (err) {
    res.status(500).json(err);
  }
});

// PUT update user
router.put("/:id", async (req, res) => {
  const { username, email, password_hash, role, status } = req.body;

  try {
    const userRepository = AppDataSource.getRepository("User");
    const updateData = {
      username,
      email,
      password_hash,
    };

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
