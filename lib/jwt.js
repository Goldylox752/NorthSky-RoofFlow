const jwt = require("jsonwebtoken");
const crypto = require("crypto");

/* ===============================
   ENV
=============================== */
const getSecret = () => {
  if (!process.env.JWT_SECRET) throw new Error("Missing JWT_SECRET");
  return process.env.JWT_SECRET;
};

const getRefreshSecret = () => {
  if (!process.env.JWT_REFRESH_SECRET) throw new Error("Missing JWT_REFRESH_SECRET");
  return process.env.JWT_REFRESH_SECRET;
};

/* ===============================
   BASE CONFIG
=============================== */
const BASE_CONFIG = {
  issuer: "flow-os-backend",
  audience: "flow-os-client",
};

/* ===============================
   SAFE PAYLOAD
=============================== */
const sanitizePayload = (payload) => {
  const { password, hash, token, ...safe } = payload;
  return safe;
};

/* ===============================
   ACCESS TOKEN
=============================== */
const signAccessToken = (payload) => {
  return jwt.sign(
    {
      ...sanitizePayload(payload),
      jti: crypto.randomUUID(), // 🔥 session tracking
      type: "access",
    },
    getSecret(),
    {
      ...BASE_CONFIG,
      expiresIn: "15m",
    }
  );
};

/* ===============================
   REFRESH TOKEN (ROTATION READY)
=============================== */
const signRefreshToken = (payload) => {
  return jwt.sign(
    {
      ...sanitizePayload(payload),
      jti: crypto.randomUUID(),
      type: "refresh",
    },
    getRefreshSecret(),
    {
      ...BASE_CONFIG,
      expiresIn: "30d",
    }
  );
};

/* ===============================
   VERIFY ACCESS
=============================== */
const verifyToken = (token) => {
  const decoded = jwt.verify(token, getSecret(), BASE_CONFIG);

  if (decoded.type !== "access") {
    throw new Error("Invalid token type");
  }

  return decoded;
};

/* ===============================
   VERIFY REFRESH
=============================== */
const verifyRefreshToken = (token) => {
  const decoded = jwt.verify(token, getRefreshSecret(), BASE_CONFIG);

  if (decoded.type !== "refresh") {
    throw new Error("Invalid refresh token type");
  }

  return decoded;
};

/* ===============================
   DECODE (NO SECURITY)
=============================== */
const decodeToken = (token) => jwt.decode(token);

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
};