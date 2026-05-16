const app = require("./src/app");

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

/* ===============================
   GRACEFUL SHUTDOWN
=============================== */
const shutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);

  server.close(() => {
    console.log("✅ HTTP server closed");
    process.exit(0);
  });

  // force exit after 10s
  setTimeout(() => {
    console.error("❌ Forced shutdown");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));