const jwt = require("jsonwebtoken");
const AppDataSource = require("../data-source");
const { JWT_SECRET } = require("../config/auth");

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

function verifyAccessToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(user);
    });
  });
}

async function getApprovedUser(decodedUser) {
  if (!decodedUser || decodedUser.token_type !== "access") {
    return null;
  }

  const user = await AppDataSource.getRepository("User").findOneBy({
    id: Number(decodedUser.id),
  });

  if (!user || user.status !== "approved") {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
  };
}

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && authHeader.split(" ")[1];
  const token = getCookieValue(req, "token") || bearerToken;

  if (!token) {
    return res.status(401).json({ message: "Token is missing" });
  }

  try {
    const decodedUser = await verifyAccessToken(token);

    if (decodedUser.token_type !== "access") {
      return res.status(401).json({ message: "Invalid token type" });
    }

    const currentUser = await getApprovedUser(decodedUser);

    if (!currentUser) {
      return res.status(401).json({
        code: "ACCOUNT_NOT_APPROVED",
        message: "Account is not active or no longer approved",
      });
    }

    req.user = currentUser;
    req.tokenPayload = decodedUser;
    next();
  } catch (err) {
    return res.status(401).json({
        message:
          err.name === "TokenExpiredError"
            ? "Access token expired"
            : "Token is not valid",
    });
  }
}

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && authHeader.split(" ")[1];
  const token = getCookieValue(req, "token") || bearerToken;

  if (!token) {
    return next();
  }

  try {
    const decodedUser = await verifyAccessToken(token);
    const currentUser = await getApprovedUser(decodedUser);

    if (currentUser) {
      req.user = currentUser;
      req.tokenPayload = decodedUser;
    }
  } catch {
    // Optional auth should not block public routes when a token is missing/expired.
  }

  next();
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication is required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "You are not authorized" });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
};
