const JWT_SECRET = process.env.JWT_SECRET || "ef_enroll_secret_key";
const JWT_EXPIRES_IN = "1d";

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN,
};
