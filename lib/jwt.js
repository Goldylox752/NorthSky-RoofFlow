const jwt = require("jsonwebtoken");

/* ===============================
   ENV SAFETY
=============================== */
const getSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Missing JWT_SECRET");
  }

  return secret;
};

const getRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("Missing JWT_REFRESH_SECRET");
  }

  return secret;
};

/* ===============================
   JWT CONFIG
=============================== */
const JWT_CONFIG = {
  issuer: "flow-os-backend",
  audience: "flow-os-client",
};

/* ===============================
   SAFE PAYLOAD FILTER
   (prevents leaking passwords, etc.)
=============================== */
const sanitizePayload = (payload) => {
  const { password, hash, ...safe } = payload;
  return safe;
};

/* ===============================
   ACCESS TOKEN (SHORT LIVED)
=============================== */
const signAccessToken = (payload) => {
  return jwt.sign(sanitizePayload(payload), getSecret(), {
    ...JWT_CONFIG,
    expiresIn: "15m",
  });
};

/* ===============================
   REFRESH TOKEN (LONG LIVED)
=============================== */
const signRefreshToken = (payload) => {
  return jwt.sign(sanitizePayload(payload), getRefreshSecret(), {
    ...JWT_CONFIG,
    expiresIn: "30d",
  });
};

/* ===============================
   VERIFY ACCESS TOKEN
=============================== */
const verifyToken = (token) => {
  if (!token || typeof token !== "string") {
    throw new Error("Invalid token format");
  }

  try {
    return jwt.verify(token, getSecret(), JWT_CONFIG);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new Error("Token expired");
    }
    if (err.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    throw err;
  }
};

/* ===============================
   VERIFY REFRESH TOKEN
=============================== */
const verifyRefreshToken = (token) => {
  if (!token || typeof token !== "string") {
    throw new Error("Invalid refresh token format");
  }

  return jwt.verify(token, getRefreshSecret(), JWT_CONFIG);
};

/* ===============================
   DECODE (NO VALIDATION)
=============================== */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
};