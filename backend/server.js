require("dotenv").config();
const app = require("./app");

/* ===============================
   ENV SETUP
=============================== */

const PORT = process.env.PORT || 3000;

process.env.NODE_ENV ||= "development";

const isProd = process.env.NODE_ENV === "production";

/* ===============================
   START SERVER
=============================== */

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});

/* ===============================
   CONNECTION TRACKING
=============================== */

const connections = new Set();

server.on("connection", (conn) => {
  connections.add(conn);

  conn.on("close", () => {
    connections.delete(conn);
  });
});

/* ===============================
   SERVER HARDENING
=============================== */

server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;

/* ===============================
   ERROR HANDLING
=============================== */

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);

  if (isProd) process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);

  if (isProd) process.exit(1);
});

/* ===============================
   GRACEFUL SHUTDOWN
=============================== */

function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);

  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });

  // force exit if hanging
  setTimeout(() => {
    console.error("Forced shutdown due to timeout");
    process.exit(1);
  }, 10000).unref();

  // close all open connections
  for (const conn of connections) {
    conn.destroy();
  }
}

/* ===============================
   SIGNAL HANDLERS
=============================== */

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));