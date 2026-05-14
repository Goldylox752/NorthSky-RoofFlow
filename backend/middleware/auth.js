// middleware/auth.js
const { requireAuth } = require("@clerk/express");
const logger = require("../lib/logger");

// Clerk middleware (production safe)
const auth = (req, res, next) => {
  return requireAuth()(req, res, (err) => {
    if (err) {
      logger.warn(
        {
          error: err.message,
          path: req.path,
        },
        "Clerk auth failed"
      );

      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    // Clerk injects auth into req.auth
    req.user = {
      id: req.auth.userId,
    };

    next();
  });
};

module.exports = auth;