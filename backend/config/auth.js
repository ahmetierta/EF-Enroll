const JWT_SECRET = process.env.JWT_SECRET || "ef_enroll_secret_key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "ef_enroll_refresh_secret_key";
const JWT_EXPIRES_IN = "15m";
const JWT_REFRESH_EXPIRES_IN = "30d";

module.exports = {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
};
