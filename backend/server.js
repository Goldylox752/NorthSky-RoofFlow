require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

/* ===============================
   PRODUCTION HARDENING
=============================== */
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

/* ===============================
   CRASH SAFETY
=============================== */
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});