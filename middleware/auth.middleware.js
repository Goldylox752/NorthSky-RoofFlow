const { verifyToken } = require("../lib/jwt");
const { getSession } = require("../lib/sessionStore");

const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Missing token",
      });
    }

    const token = header.split(" ")[1];

    const decoded = verifyToken(token);

    // 🔐 session validation (CRITICAL)
    const session = getSession(decoded.jti);

    if (!session) {
      return res.status(401).json({
        success: false,
        error: "Session expired or revoked",
      });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      plan: decoded.plan,
      jti: decoded.jti,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }
};

module.exports = auth;