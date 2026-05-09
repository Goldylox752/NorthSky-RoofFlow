require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 3001;

if (!process.env.PORT) {
  console.warn("⚠️ PORT not set in env, using fallback 3001");
}

/* ===============================
   START SERVER (SAFE WRAP)
=============================== */
let server;

try {
  server = app.listen(PORT, () => {
    console.log("=================================");
    console.log("🚀 Server Running");
    console.log(`🌎 Port: ${PORT}`);
    console.log(`🟢 Health: /health`);
    console.log("=================================");
  });

  /* ===============================
     PERFORMANCE / CONNECTION SAFETY
  =============================== */
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

} catch (err) {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
}

/* ===============================
   GRACEFUL SHUTDOWN HANDLER
=============================== */
const shutdown = (reason, err, exitCode = 1) => {
  console.error(`❌ Shutdown triggered: ${reason}`);

  if (err) {
    console.error(err);
  }

  if (!server) {
    process.exit(exitCode);
  }

  server.close(() => {
    console.log("🔴 HTTP server closed cleanly");
    process.exit(exitCode);
  });
};

/* ===============================
   CRASH HANDLERS
=============================== */
process.on("uncaughtException", (err) => {
  shutdown("Uncaught Exception", err, 1);
});

process.on("unhandledRejection", (err) => {
  shutdown("Unhandled Promise Rejection", err, 1);
});

/* ===============================
   SYSTEM SIGNAL HANDLERS
=============================== */
process.on("SIGTERM", () => {
  console.log("📴 SIGTERM received");
  shutdown("SIGTERM", null, 0);
});

process.on("SIGINT", () => {
  console.log("📴 SIGINT received");
  shutdown("SIGINT", null, 0);
});