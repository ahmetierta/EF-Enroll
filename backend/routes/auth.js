const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const express = require("express");
const jwt = require("jsonwebtoken");
const AppDataSource = require("../data-source");
const {
  frontendUrl,
  sendPasswordResetEmail,
} = require("../config/email");
const {
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
} = require("../config/auth");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();
const RESET_TOKEN_EXPIRES_MS = 15 * 60 * 1000;

const accessCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 15 * 60 * 1000,
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 60 * 60 * 1000,
};

function getCookieValue(req, name) {
  const cookies = req.headers.cookie;

  if (!cookies) {
    return null;
  }

  const cookie = cookies
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
}

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

function createRefreshToken(user) {
  return jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
}

function hashPasswordResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createPasswordResetToken() {
  const token = crypto.randomBytes(32).toString("hex");

  return {
    token,
    tokenHash: hashPasswordResetToken(token),
    expiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRES_MS),
  };
}

function buildUserResponse(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
  };
}

async function createStudentNumber(studentRepository) {
  const year = new Date().getFullYear();
  const count = await studentRepository.count();
  return `STU-${year}-${String(count + 1).padStart(4, "0")}`;
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
    const refreshToken = createRefreshToken(user);

    res.cookie("token", token, accessCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    res.json({
      message: "Login successful",
      user: buildUserResponse(user),
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/refresh", async (req, res) => {
  const refreshToken = getCookieValue(req, "refreshToken");

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is missing" });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const userRepository = AppDataSource.getRepository("User");
    const user = await userRepository.findOneBy({ id: decoded.id });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.status !== "approved") {
      return res.status(403).json({
        message: "Your account is waiting for admin approval",
        status: user.status,
      });
    }

    res.cookie("token", createToken(user), accessCookieOptions);

    res.json({
      message: "Token refreshed",
      user: buildUserResponse(user),
    });
  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const responseBody = {
    message: "If an account exists with this email, a reset link has been sent.",
  };

  try {
    const userRepository = AppDataSource.getRepository("User");
    const user = await userRepository.findOneBy({ email });

    if (!user) {
      return res.json(responseBody);
    }

    const { token, tokenHash, expiresAt } = createPasswordResetToken();

    user.reset_password_token = tokenHash;
    user.reset_password_expires = expiresAt;

    await userRepository.save(user);

    const resetLink = `${frontendUrl}/reset-password/${token}`;
    const emailResult = await sendPasswordResetEmail(user.email, resetLink);

    if (emailResult.previewLink && process.env.NODE_ENV !== "production") {
      responseBody.devResetLink = emailResult.previewLink;
    }

    res.json(responseBody);
  } catch (err) {
    res.status(500).json({ message: "Password reset email could not be sent" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Token and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long",
    });
  }

  try {
    const userRepository = AppDataSource.getRepository("User");
    const tokenHash = hashPasswordResetToken(token);
    const user = await userRepository.findOneBy({
      reset_password_token: tokenHash,
    });

    if (!user || !user.reset_password_expires) {
      return res.status(400).json({ message: "Reset link is invalid or expired" });
    }

    if (new Date(user.reset_password_expires).getTime() <= Date.now()) {
      user.reset_password_token = null;
      user.reset_password_expires = null;
      await userRepository.save(user);

      return res.status(400).json({ message: "Reset link is invalid or expired" });
    }

    user.password_hash = bcrypt.hashSync(password, 10);
    user.reset_password_token = null;
    user.reset_password_expires = null;

    await userRepository.save(user);

    res.cookie("token", "", { ...accessCookieOptions, maxAge: 1 });
    res.cookie("refreshToken", "", { ...refreshCookieOptions, maxAge: 1 });

    res.json({ message: "Password reset successfully. You can log in now." });
  } catch (err) {
    res.status(500).json({ message: "Password could not be reset" });
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
      const studentNumber =
        numri_studentit || (await createStudentNumber(studentRepository));

      const savedUser = await userRepository.save({
        username,
        email,
        password_hash: passwordHash,
        role: "student",
        status: "approved",
      });

      const savedStudent = await studentRepository.save({
        user: savedUser,
        numri_studentit: studentNumber,
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

router.post("/logout", (req, res) => {
  res.cookie("token", "", { ...accessCookieOptions, maxAge: 1 });
  res.cookie("refreshToken", "", { ...refreshCookieOptions, maxAge: 1 });

  res.json({ message: "Logged out successfully" });
});

module.exports = router;
