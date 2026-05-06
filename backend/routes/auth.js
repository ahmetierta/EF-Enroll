const bcrypt = require("bcryptjs");
const express = require("express");
const jwt = require("jsonwebtoken");
const AppDataSource = require("../data-source");
const { JWT_EXPIRES_IN, JWT_SECRET } = require("../config/auth");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const userRepository = AppDataSource.getRepository("User");
    const user = await userRepository.findOneBy({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatches = bcrypt.compareSync(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status !== "approved") {
      return res.status(403).json({
        message: "Your account is waiting for admin approval",
        status: user.status,
      });
    }

    const token = createToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/register/student", async (req, res) => {
  const {
    username,
    email,
    password,
    numri_studentit,
    programi,
    viti_studimit,
  } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Username, email and password are required" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    const { user, student } = await AppDataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository("User");
      const studentRepository = manager.getRepository("Student");

      const savedUser = await userRepository.save({
        username,
        email,
        password_hash: passwordHash,
        role: "student",
        status: "approved",
      });

      const savedStudent = await studentRepository.save({
        user: savedUser,
        numri_studentit,
        programi,
        viti_studimit,
      });

      return { user: savedUser, student: savedStudent };
    });

    res.status(201).json({
      message: "Student account created successfully",
      user_id: user.id,
      student_id: student.id,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/register/professor", async (req, res) => {
  const { username, email, password, titulli, departamenti } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Username, email and password are required" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    const { user, professor } = await AppDataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository("User");
      const professorRepository = manager.getRepository("Professor");

      const savedUser = await userRepository.save({
        username,
        email,
        password_hash: passwordHash,
        role: "professor",
        status: "pending",
      });

      const savedProfessor = await professorRepository.save({
        user: savedUser,
        titulli,
        departamenti,
      });

      return { user: savedUser, professor: savedProfessor };
    });

    res.status(201).json({
      message: "Professor account created and waiting for admin approval",
      user_id: user.id,
      professor_id: professor.id,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/me", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
