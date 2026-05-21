// auth.middleware.js
const { verifyToken } = require("@clerk/backend");

module.exports = async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "missing_auth" });
    }

    const token = header.split(" ")[1];

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    req.user = {
      id: payload.sub,
      email: payload.email || null,
      role: payload.public_metadata?.role || "user",
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "unauthorized" });
  }
};