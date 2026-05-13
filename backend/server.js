require("dotenv").config();

const app = require("./app");

const PORT = Number(process.env.PORT || 3001);

/* ===============================
   BASIC SAFETY CHECKS
=============================== */
if (!process.env.PORT) {
  console.warn("⚠️ PORT not set — using fallback 3001");
}

/* ===============================
   START SERVER
=============================== */
let server;

const startServer = () => {
  try {
    server = app.listen(PORT, () => {
      console.log(`
🚀 Server Running
📡 Port: ${PORT}
❤️ Health: /health
      `);
    });

    // Render / cloud stability tuning
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;
  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
};

startServer();

/* ===============================
   GRACEFUL SHUTDOWN
=============================== */
let shuttingDown = false;

const shutdown = (signal, err = null) => {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`\n🛑 Shutdown: ${signal}`);

  if (err) console.error(err);

  if (!server) {
    process.exit(1);
  }

  server.close(() => {
    console.log("✅ Server closed cleanly");
    process.exit(0);
  });

  // force exit fallback
  setTimeout(() => {
    console.error("⚠️ Forced shutdown timeout");
    process.exit(1);
  }, 10000).unref();
};

/* ===============================
   ERROR HANDLERS
=============================== */
process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception");
  shutdown("uncaughtException", err);
});

process.on("unhandledRejection", (err) => {
  console.error("🔥 Unhandled Rejection");
  shutdown("unhandledRejection", err);
});

/* ===============================
   SIGNAL HANDLERS
=============================== */
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));