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
  ACCESS_TOKEN_MAX_AGE_MS,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_MAX_AGE_MS,
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
} = require("../config/auth");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();
const RESET_TOKEN_EXPIRES_MS = 15 * 60 * 1000;
const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const NAME_PATTERN = /^[\p{L}][\p{L}\s'.-]{1,99}$/u;
const STUDENT_NUMBER_PATTERN = /^STU-\d{4}-\d{4}$/i;

const accessCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: ACCESS_TOKEN_MAX_AGE_MS,
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: REFRESH_TOKEN_MAX_AGE_MS,
};

const sessionCookieOptions = refreshCookieOptions;

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
      token_type: "access",
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function clearAuthCookies(res) {
  res.cookie("token", "", { ...accessCookieOptions, maxAge: 1 });
  res.cookie("refreshToken", "", { ...refreshCookieOptions, maxAge: 1 });
  res.cookie("sessionId", "", { ...sessionCookieOptions, maxAge: 1 });
}

function createRefreshToken(user, tokenId) {
  return jwt.sign({ id: user.id, token_type: "refresh" }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    jwtid: tokenId,
  });
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function hashPasswordResetToken(token) {
  return hashToken(token);
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

function getRequestIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (forwardedFor) {
    return String(forwardedFor).split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || null;
}

function getSessionMetadata(req) {
  return {
    user_agent: String(req.headers["user-agent"] || "").slice(0, 255) || null,
    ip_address: getRequestIp(req),
    last_seen_at: new Date(),
  };
}

function getRefreshTokenFromRequest(req) {
  return getCookieValue(req, "sessionId") || getCookieValue(req, "refreshToken");
}

async function issueAuthCookies(res, req, user, oldRefreshTokenRecord = null) {
  const refreshTokenRepository = AppDataSource.getRepository("RefreshToken");
  const refreshTokenId = crypto.randomUUID();
  const token = createToken(user);
  const refreshToken = createRefreshToken(user, refreshTokenId);
  const refreshTokenHash = hashToken(refreshToken);

  const refreshRecord = refreshTokenRepository.create({
    user,
    token_hash: refreshTokenHash,
    expires_at: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
    ...getSessionMetadata(req),
  });

  await refreshTokenRepository.save(refreshRecord);

  if (oldRefreshTokenRecord) {
    oldRefreshTokenRecord.revoked_at = new Date();
    oldRefreshTokenRecord.replaced_by_token_hash = refreshTokenHash;
    oldRefreshTokenRecord.last_seen_at = new Date();
    await refreshTokenRepository.save(oldRefreshTokenRecord);
  }

  res.cookie("token", token, accessCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);
  res.cookie("sessionId", refreshToken, sessionCookieOptions);

  return { token, refreshToken };
}

async function revokeRefreshToken(refreshToken) {
  if (!refreshToken) {
    return null;
  }

  const refreshTokenRepository = AppDataSource.getRepository("RefreshToken");
  const tokenHash = hashToken(refreshToken);
  const tokenRecord = await refreshTokenRepository.findOne({
    where: { token_hash: tokenHash },
  });

  if (!tokenRecord || tokenRecord.revoked_at) {
    return tokenRecord;
  }

  tokenRecord.revoked_at = new Date();
  return refreshTokenRepository.save(tokenRecord);
}

async function revokeUserRefreshTokens(userId, exceptTokenHash = null) {
  const query = AppDataSource.getRepository("RefreshToken")
    .createQueryBuilder()
    .update("RefreshToken")
    .set({ revoked_at: new Date() })
    .where("user_id = :userId", { userId })
    .andWhere("revoked_at IS NULL");

  if (exceptTokenHash) {
    query.andWhere("token_hash != :exceptTokenHash", { exceptTokenHash });
  }

  return query.execute();
}

async function createStudentNumber(studentRepository) {
  const year = new Date().getFullYear();
  const count = await studentRepository.count();
  return `STU-${year}-${String(count + 1).padStart(4, "0")}`;
}

function isValidEmail(email) {
  return EMAIL_PATTERN.test(email);
}

function isValidName(name) {
  return NAME_PATTERN.test(String(name || "").trim());
}

function isValidPassword(password) {
  return typeof password === "string" && password.length >= 6;
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const userRepository = AppDataSource.getRepository("User");
    const user = await userRepository.findOneBy({ email: normalizedEmail });

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

    await issueAuthCookies(res, req, user);

    res.json({
      message: "Login successful",
      user: buildUserResponse(user),
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/refresh", async (req, res) => {
  const refreshToken = getRefreshTokenFromRequest(req);

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is missing" });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const refreshTokenRepository = AppDataSource.getRepository("RefreshToken");
    const userRepository = AppDataSource.getRepository("User");
    const refreshTokenHash = hashToken(refreshToken);

    if (decoded.token_type !== "refresh") {
      return res.status(401).json({ message: "Invalid refresh token type" });
    }

    const tokenRecord = await refreshTokenRepository.findOne({
      where: { token_hash: refreshTokenHash },
      relations: { user: true },
    });

    if (
      !tokenRecord ||
      tokenRecord.user?.id !== decoded.id ||
      new Date(tokenRecord.expires_at).getTime() <= Date.now()
    ) {
      clearAuthCookies(res);
      return res.status(401).json({ message: "Refresh token is not recognized" });
    }

    if (tokenRecord.revoked_at) {
      await revokeUserRefreshTokens(decoded.id);
      clearAuthCookies(res);

      return res.status(401).json({
        message: "Refresh token was already used. Please log in again.",
      });
    }

    const user = await userRepository.findOneBy({ id: decoded.id });

    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({ message: "User not found" });
    }

    if (user.status !== "approved") {
      tokenRecord.revoked_at = new Date();
      await refreshTokenRepository.save(tokenRecord);
      clearAuthCookies(res);

      return res.status(403).json({
        message: "Your account is waiting for admin approval",
        status: user.status,
      });
    }

    await issueAuthCookies(res, req, user, tokenRecord);

    res.json({
      message: "Token refreshed",
      user: buildUserResponse(user),
    });
  } catch (err) {
    clearAuthCookies(res);
    res.status(401).json({
      message:
        err.name === "TokenExpiredError"
          ? "Refresh token expired"
          : "Invalid refresh token",
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({ message: "Email is required" });
  }

  const responseBody = {
    message: "If an account exists with this email, a reset link has been sent.",
  };

  try {
    const userRepository = AppDataSource.getRepository("User");
    const user = await userRepository.findOneBy({ email: normalizedEmail });

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
    await AppDataSource.getRepository("RefreshToken")
      .createQueryBuilder()
      .update("RefreshToken")
      .set({ revoked_at: new Date() })
      .where("user_id = :userId", { userId: user.id })
      .andWhere("revoked_at IS NULL")
      .execute();

    clearAuthCookies(res);

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
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const trimmedUsername = String(username || "").trim();

  if (!trimmedUsername || !normalizedEmail || !password) {
    return res.status(400).json({ message: "Full name, email and password are required" });
  }

  if (!isValidName(trimmedUsername)) {
    return res.status(400).json({ message: "Full name is not valid" });
  }

  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({ message: "Email format is not valid" });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long",
    });
  }

  if (numri_studentit && !STUDENT_NUMBER_PATTERN.test(numri_studentit)) {
    return res.status(400).json({ message: "Student number must look like STU-2026-0001" });
  }

  const studyYear = Number(viti_studimit);

  if (!programi || !Number.isInteger(studyYear) || studyYear < 1 || studyYear > 5) {
    return res.status(400).json({ message: "Program and year of study are required" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    const { user, student } = await AppDataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository("User");
      const studentRepository = manager.getRepository("Student");
      const existingUser = await userRepository.findOneBy({
        email: normalizedEmail,
      });

      if (existingUser) {
        const error = new Error("Email already exists");
        error.status = 409;
        throw error;
      }

      const studentNumber =
        numri_studentit || (await createStudentNumber(studentRepository));

      const savedUser = await userRepository.save({
        username: trimmedUsername,
        email: normalizedEmail,
        password_hash: passwordHash,
        role: "student",
        status: "approved",
      });

      const savedStudent = await studentRepository.save({
        user: savedUser,
        numri_studentit: studentNumber,
        programi,
        viti_studimit: studyYear,
      });

      return { user: savedUser, student: savedStudent };
    });

    res.status(201).json({
      message: "Student account created successfully",
      user_id: user.id,
      student_id: student.id,
    });
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.status ? err.message : "Student account could not be created",
    });
  }
});

router.post("/register/professor", async (req, res) => {
  const { username, email, password, titulli, departamenti } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const trimmedUsername = String(username || "").trim();

  if (!trimmedUsername || !normalizedEmail || !password) {
    return res.status(400).json({ message: "Full name, email and password are required" });
  }

  if (!isValidName(trimmedUsername)) {
    return res.status(400).json({ message: "Full name is not valid" });
  }

  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({ message: "Email format is not valid" });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long",
    });
  }

  if (!titulli || !departamenti) {
    return res.status(400).json({ message: "Title and department are required" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    const { user, professor } = await AppDataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository("User");
      const professorRepository = manager.getRepository("Professor");
      const existingUser = await userRepository.findOneBy({
        email: normalizedEmail,
      });

      if (existingUser) {
        const error = new Error("Email already exists");
        error.status = 409;
        throw error;
      }

      const savedUser = await userRepository.save({
        username: trimmedUsername,
        email: normalizedEmail,
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
    res.status(err.status || 500).json({
      message: err.status ? err.message : "Professor account could not be created",
    });
  }
});

router.get("/me", authenticateToken, (req, res) => {
  res.json({
    user: req.user,
    access_token_expires_at: req.tokenPayload?.exp
      ? new Date(req.tokenPayload.exp * 1000).toISOString()
      : null,
  });
});

router.get("/sessions", authenticateToken, async (req, res) => {
  try {
    const currentRefreshToken = getRefreshTokenFromRequest(req);
    const currentRefreshTokenHash = currentRefreshToken
      ? hashToken(currentRefreshToken)
      : null;
    const sessions = await AppDataSource.getRepository("RefreshToken")
      .createQueryBuilder("refreshToken")
      .where("refreshToken.user_id = :userId", { userId: req.user.id })
      .andWhere("refreshToken.revoked_at IS NULL")
      .andWhere("refreshToken.expires_at > :now", { now: new Date() })
      .orderBy("refreshToken.created_at", "DESC")
      .getMany();

    res.json(
      sessions.map((session) => ({
        id: session.id,
        created_at: session.created_at,
        expires_at: session.expires_at,
        expires_in_seconds: Math.max(
          Math.floor((new Date(session.expires_at).getTime() - Date.now()) / 1000),
          0
        ),
        user_agent: session.user_agent,
        ip_address: session.ip_address,
        last_seen_at: session.last_seen_at,
        status: "active",
        current: session.token_hash === currentRefreshTokenHash,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: "Sessions could not be loaded" });
  }
});

router.delete("/sessions", authenticateToken, async (req, res) => {
  try {
    const currentRefreshToken = getRefreshTokenFromRequest(req);
    const currentRefreshTokenHash = currentRefreshToken
      ? hashToken(currentRefreshToken)
      : null;

    if (!currentRefreshTokenHash) {
      return res.status(400).json({ message: "Current session is missing" });
    }

    const result = await revokeUserRefreshTokens(
      req.user.id,
      currentRefreshTokenHash
    );

    res.json({
      message: "Other sessions revoked successfully",
      revoked_count: result.affected || 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Sessions could not be revoked" });
  }
});

router.delete("/sessions/:id", authenticateToken, async (req, res) => {
  try {
    const currentRefreshToken = getRefreshTokenFromRequest(req);
    const currentRefreshTokenHash = currentRefreshToken
      ? hashToken(currentRefreshToken)
      : null;
    const refreshTokenRepository = AppDataSource.getRepository("RefreshToken");
    const session = await refreshTokenRepository
      .createQueryBuilder("refreshToken")
      .where("refreshToken.id = :id", { id: Number(req.params.id) })
      .andWhere("refreshToken.user_id = :userId", { userId: req.user.id })
      .getOne();

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.revoked_at = new Date();
    await refreshTokenRepository.save(session);

    if (session.token_hash === currentRefreshTokenHash) {
      clearAuthCookies(res);
    }

    res.json({
      message: "Session revoked successfully",
      current_session_revoked: session.token_hash === currentRefreshTokenHash,
    });
  } catch (err) {
    res.status(500).json({ message: "Session could not be revoked" });
  }
});

router.post("/logout-all", authenticateToken, async (req, res) => {
  try {
    const result = await revokeUserRefreshTokens(req.user.id);
    clearAuthCookies(res);

    res.json({
      message: "Logged out from all sessions successfully",
      revoked_count: result.affected || 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Sessions could not be revoked" });
  }
});

router.post("/logout", async (req, res) => {
  const refreshToken = getRefreshTokenFromRequest(req);

  try {
    await revokeRefreshToken(refreshToken);
  } catch {
    // Logout should still clear local cookies even if revocation fails.
  }

  clearAuthCookies(res);

  res.json({ message: "Logged out successfully" });
});

module.exports = router;
