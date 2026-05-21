require("dotenv").config();

/* ===============================
   SAFE APP BOOTSTRAP
=============================== */
let app;

try {
  app = require("./app");

  if (!app || typeof app.listen !== "function") {
    throw new Error("app.js must export an Express instance");
  }
} catch (err) {
  console.error("❌ Failed to load app");
  console.error(err.message || err);
  process.exit(1);
}

/* ===============================
   PORT CONFIG
=============================== */
const PORT = normalizePort(process.env.PORT || "3000");

function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

/* ===============================
   START SERVER
=============================== */
const server = app.listen(PORT, () => {
  console.log("\n==================================");
  console.log("🚀 Server Online");
  console.log(`🌐 Port: ${PORT}`);
  console.log(`❤️ Health: /health`);
  console.log(`📡 API: /api`);
  console.log("==================================\n");
});

/* ===============================
   TIMEOUT HARDENING
=============================== */
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

/* ===============================
   GLOBAL STATE
=============================== */
let isShuttingDown = false;

/* ===============================
   GRACEFUL SHUTDOWN
=============================== */
function shutdown(signal, error) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n⚠️ Shutdown initiated: ${signal}`);

  if (error) {
    console.error("Error:", error);
  }

  // Stop accepting new requests
  server.close(() => {
    console.log("✅ Server closed cleanly");
    process.exit(0);
  });

  // Force exit fallback
  setTimeout(() => {
    console.error("❌ Forced shutdown (timeout reached)");
    process.exit(1);
  }, 10000).unref();
}

/* ===============================
   ERROR HANDLING
=============================== */
process.on("uncaughtException", (err) => {
  console.error("\n💥 Uncaught Exception");
  shutdown("uncaughtException", err);
});

process.on("unhandledRejection", (err) => {
  console.error("\n💥 Unhandled Promise Rejection");
  shutdown("unhandledRejection", err);
});

/* ===============================
   SIGNAL HANDLING
=============================== */
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

/* ===============================
   OPTIONAL: KEEP-ALIVE LOG
   (useful on Render cold start debugging)
=============================== */
setInterval(() => {
  if (!isShuttingDown) {
    console.log("💓 heartbeat:", new Date().toISOString());
  }
}, 60000).unref();