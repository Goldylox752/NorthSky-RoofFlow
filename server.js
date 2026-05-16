require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 3000;

/* ===============================
   START SERVER (SAFE BOOT)
=============================== */
const server = app.listen(PORT, () => {
  console.log("=================================");
  console.log("NorthSky Server Online");
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("=================================");
});

/* ===============================
   STATE TRACKING
=============================== */
let isShuttingDown = false;

/* ===============================
   GRACEFUL SHUTDOWN (PRODUCTION SAFE)
=============================== */
function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`Shutdown triggered: ${signal}`);

  try {
    server.close(() => {
      console.log("HTTP server closed cleanly");
    });

    // Future hooks:
    // await closeDatabase();
    // await closeRedis();
    // await stopWorkers();

  } catch (err) {
    console.error("Error during shutdown:", err);
  }

  setTimeout(() => {
    console.error("Forced shutdown due to timeout");
    process.exit(1);
  }, 10000).unref();
}

/* ===============================
   SIGNAL HANDLERS
=============================== */
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

/* ===============================
   GLOBAL ERROR SAFETY
=============================== */
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  shutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  shutdown("unhandledRejection");
});