const { verifyToken } = require("@clerk/backend");
const logger = require("../lib/logger");

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Missing authorization header",
      });
    }

    const token = header.split(" ")[1];

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    if (!payload?.sub) {
      return res.status(401).json({
        success: false,
        error: "Invalid session",
      });
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.public_metadata?.role || "user",
      plan: payload.public_metadata?.plan || "starter",
    };

    next();
  } catch (err) {
    logger.warn(
      {
        error: err.message,
        path: req.path,
        ip: req.ip,
      },
      "Clerk auth failed"
    );

    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }
};

module.exports = auth;