require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

/* ===============================
   CORS
=============================== */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

/* ===============================
   NORMAL JSON MIDDLEWARE
=============================== */
app.use(express.json());

/* ===============================
   ROUTES
=============================== */
app.use("/api/payments", require("./routes/payments"));
app.use("/api/webhook", require("./routes/webhook"));

/* ===============================
   HEALTH CHECK
=============================== */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Flow OS backend running",
  });
});

/* ===============================
   404 HANDLER
=============================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

module.exports = app;