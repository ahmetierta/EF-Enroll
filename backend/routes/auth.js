const bcrypt = require("bcryptjs");
const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db");
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

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], (err, users) => {
    if (err) return res.status(500).json(err);

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users[0];
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
  });
});

router.post("/register/student", (req, res) => {
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
  const userSql =
    "INSERT INTO users (username, email, password_hash, role, status) VALUES (?, ?, ?, 'student', 'approved')";

  db.query(userSql, [username, email, passwordHash], (err, userResult) => {
    if (err) return res.status(500).json(err);

    const studentSql =
      "INSERT INTO students (user_id, numri_studentit, programi, viti_studimit) VALUES (?, ?, ?, ?)";

    db.query(
      studentSql,
      [userResult.insertId, numri_studentit, programi, viti_studimit],
      (err, studentResult) => {
        if (err) return res.status(500).json(err);

        res.status(201).json({
          message: "Student account created successfully",
          user_id: userResult.insertId,
          student_id: studentResult.insertId,
        });
      }
    );
  });
});

router.post("/register/professor", (req, res) => {
  const { username, email, password, titulli, departamenti } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Username, email and password are required" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const userSql =
    "INSERT INTO users (username, email, password_hash, role, status) VALUES (?, ?, ?, 'professor', 'pending')";

  db.query(userSql, [username, email, passwordHash], (err, userResult) => {
    if (err) return res.status(500).json(err);

    const professorSql =
      "INSERT INTO professors (user_id, titulli, departamenti) VALUES (?, ?, ?)";

    db.query(
      professorSql,
      [userResult.insertId, titulli, departamenti],
      (err, professorResult) => {
        if (err) return res.status(500).json(err);

        res.status(201).json({
          message: "Professor account created and waiting for admin approval",
          user_id: userResult.insertId,
          professor_id: professorResult.insertId,
        });
      }
    );
  });
});

router.get("/me", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
