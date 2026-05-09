require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

/* ===============================
   TRUST PROXY
=============================== */
app.set("trust proxy", 1);

/* ===============================
   CORS
=============================== */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

/* ===============================
   JSON BODY PARSER (GLOBAL)
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
    status: "healthy",
  });
});

/* ===============================
   404 HANDLER
=============================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

/* ===============================
   GLOBAL ERROR HANDLER
=============================== */
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);

  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

module.exports = app;