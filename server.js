require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 3000;

/* ===============================
   START SERVER
=============================== */
const server = app.listen(PORT, () => {
  console.log("=================================");
  console.log("NorthSky Server Online");
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("=================================");
});

/* ===============================
   STATE
=============================== */
let shuttingDown = false;

/* ===============================
   SHUTDOWN ORCHESTRATOR
=============================== */
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`Shutdown initiated: ${signal}`);

  try {
    await stopHttpServer();
    await cleanupResources();
  } catch (err) {
    console.error("Shutdown error:", err);
  }

  forceExitIfNeeded();
}

/* ===============================
   STOP HTTP SERVER
=============================== */
function stopHttpServer() {
  return new Promise((resolve) => {
    server.close((err) => {
      if (err) {
        console.error("Error closing HTTP server:", err);
      } else {
        console.log("HTTP server closed cleanly");
      }
      resolve();
    });
  });
}

/* ===============================
   CLEANUP HOOKS (AI + SAAS READY)
=============================== */
async function cleanupResources() {
  // Future production hooks:
  // await closeDatabase();
  // await closeRedis();
  // await stopQueueWorkers();
  // await stopAIAgents();
  // await flushTelemetry();

  return true;
}

/* ===============================
   SAFETY FORCE EXIT
=============================== */
function forceExitIfNeeded() {
  setTimeout(() => {
    console.error("Forced shutdown (timeout reached)");
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