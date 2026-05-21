require("dotenv").config();

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function splitList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function requireSecret(name, fallback, isProduction) {
  if (isProduction && !process.env[name]) {
    throw new Error(`${name} must be configured in production.`);
  }

  return process.env[name] || fallback;
}

const env = process.env.NODE_ENV || "development";
const isProduction = env === "production";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const allowedOrigins = splitList(process.env.CORS_ORIGINS);
const defaultOrigins = [frontendUrl, "http://localhost:5173", "http://localhost:5174"];
const corsOrigins = allowedOrigins.length ? allowedOrigins : [...new Set(defaultOrigins)];

const config = {
  env,
  isProduction,
  frontendUrl,
  server: {
    port: toNumber(process.env.PORT, 5000),
  },
  database: {
    host: process.env.DB_HOST || "localhost",
    port: toNumber(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "ErtaFiorela123",
    name: process.env.DB_NAME || "ef_enroll",
  },
  auth: {
    jwtSecret: requireSecret("JWT_SECRET", "ef_enroll_secret_key", isProduction),
    jwtRefreshSecret: requireSecret(
      "JWT_REFRESH_SECRET",
      "ef_enroll_refresh_secret_key",
      isProduction
    ),
    accessTokenExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    accessTokenMaxAgeMs: 15 * 60 * 1000,
    refreshTokenMaxAgeMs: 7 * 24 * 60 * 60 * 1000,
  },
  email: {
    smtpHost: process.env.SMTP_HOST,
    smtpPort: toNumber(process.env.SMTP_PORT, 587),
    smtpSecure: process.env.SMTP_SECURE === "true",
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    smtpFrom: process.env.SMTP_FROM || process.env.SMTP_USER,
  },
  cors: {
    origins: corsOrigins,
    options: {
      credentials: true,
      origin(origin, callback) {
        if (
          !origin ||
          corsOrigins.includes("*") ||
          corsOrigins.includes(origin) ||
          !isProduction
        ) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin ${origin} is not allowed by CORS.`));
      },
    },
  },
};

module.exports = config;
