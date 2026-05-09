const router = require("express").Router();
const auth = require("../middleware/auth.middleware");

const { createPortalSession } = require("../services/billing.service");

router.post(
  "/portal",
  auth,
  async (req, res) => {
    try {
      const session = await createPortalSession(req.user.email);

      res.json({
        success: true,
        url: session.url,
      });

    } catch (err) {
      res.status(400).json({
        success: false,
        error: err.message,
      });
    }
  }
);

module.exports = router;