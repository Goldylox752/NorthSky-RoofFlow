require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log("=================================");
  console.log("🚀 NorthSky Server Running");
  console.log(`📡 Port: ${PORT}`);
  console.log("=================================");
});

/* ===============================
   GRACEFUL SHUTDOWN (PRODUCTION SAFE)
=============================== */

let shuttingDown = false;

const shutdown = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);

  server.close(() => {
    console.log("✅ HTTP server closed");

    // optional cleanup hooks (DB, queues, etc.)
    process.exit(0);
  });

  // force exit if hanging (important for Render)
  setTimeout(() => {
    console.error("⚠️ Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));