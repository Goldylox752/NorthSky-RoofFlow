require("dotenv").config();

const http = require("http");
const app = require("./server"); // <-- THIS is your Express app file you pasted

/* ===============================
   ENV CHECK
=============================== */
if (!process.env.PORT) {
  console.warn("⚠️ Missing PORT (Render will inject one automatically)");
}

/* ===============================
   CREATE HTTP SERVER
=============================== */
const server = http.createServer(app);

/* ===============================
   START SERVER
=============================== */
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("==================================");
  console.log("🚀 SERVER STARTED");
  console.log(`🌐 Port: ${PORT}`);
  console.log(`🔗 Health: /health`);
  console.log("==================================");
});

/* ===============================
   GRACEFUL ERROR HANDLING
=============================== */
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});