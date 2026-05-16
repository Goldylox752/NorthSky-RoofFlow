require("dotenv").config();

const { createApp } = require("./app");

/* ===============================
   BOOT APP
=============================== */
const app = createApp();

/* ===============================
   HEALTH CHECK (optional but useful)
=============================== */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "call-centre-api",
    timestamp: new Date().toISOString(),
  });
});

/* ===============================
   START SERVER
=============================== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 CALL CENTRE API ONLINE");
  console.log(`📡 Running on port ${PORT}`);
});