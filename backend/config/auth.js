const { auth } = require("./env");

const JWT_SECRET = auth.jwtSecret;
const JWT_REFRESH_SECRET = auth.jwtRefreshSecret;
const JWT_EXPIRES_IN = auth.accessTokenExpiresIn;
const JWT_REFRESH_EXPIRES_IN = auth.refreshTokenExpiresIn;
const ACCESS_TOKEN_MAX_AGE_MS = auth.accessTokenMaxAgeMs;
const REFRESH_TOKEN_MAX_AGE_MS = auth.refreshTokenMaxAgeMs;

module.exports = {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  ACCESS_TOKEN_MAX_AGE_MS,
  REFRESH_TOKEN_MAX_AGE_MS,
};
