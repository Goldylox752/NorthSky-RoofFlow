const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const { createPortalSession } = require("../services/stripe/portal.service");

/* ===============================
   BILLING PORTAL ROUTE
   - AUTH REQUIRED
   - RETURNS STRIPE CUSTOMER PORTAL URL
=============================== */
router.post("/portal", auth, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "unauthorized",
      });
    }

    const session = await createPortalSession(userId);

    if (!session || !session.url) {
      return res.status(500).json({
        success: false,
        error: "portal_session_failed",
      });
    }

    return res.json({
      success: true,
      url: session.url,
    });

  } catch (err) {
    console.error("Billing portal error:", err);

    return res.status(500).json({
      success: false,
      error: "internal_server_error",
    });
  }
});

module.exports = router;