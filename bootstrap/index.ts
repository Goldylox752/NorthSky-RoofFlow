const auth = require("../middleware/auth");

function bootstrapExpress(app) {
  console.log("[express] initializing...");

  // 1. PUBLIC ROUTES FIRST
  app.post("/api/telegram/webhook", require("../webhooks/telegram"));

  app.post("/stripe-webhook",
    require("express").raw({ type: "application/json" }),
    require("../webhooks/stripe")
  );

  // 2. AUTH APPLIED AFTER WEBHOOKS
  app.use("/api", auth);

  // 3. PROTECTED ROUTES
  app.get("/api/health", (req, res) => {
    res.json({ ok: true });
  });

  console.log("[express] ready");
}

module.exports = bootstrapExpress;