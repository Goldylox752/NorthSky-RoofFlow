require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

/* ===============================
   TRUST PROXY (Cloud / Vercel / Render safe)
=============================== */
app.set("trust proxy", 1);

/* ===============================
   SECURITY HARDENING
=============================== */
app.disable("x-powered-by");

/* ===============================
   RATE LIMITING (anti-spam protection)
=============================== */
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // requests per IP
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

/* ===============================
   CORS CONFIG (production-safe)
=============================== */
const allowedOrigins = new Set([
  process.env.FRONTEND_URL,
  "http://localhost:3000",
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS blocked"), false);
    },
    credentials: true,
  })
);

/* ===============================
   BODY PARSER
=============================== */
app.use(express.json({ limit: "2mb" }));

/* ===============================
   REQUEST LOGGER (lightweight)
=============================== */
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/* ===============================
   API ROUTES (LEAD SYSTEM CORE)
=============================== */

/**
 * Lead system (your main business logic)
 */
app.use("/api/leads", require("./routes/leadRoutes"));

/**
 * Webhooks (future integrations)
 */
app.use("/api/webhook", require("./routes/webhook"));

/**
 * Payments (Stripe or similar)
 */
app.use("/api/payments", require("./routes/payments"));

/**
 * Telegram bot webhook (AI lead bot sync)
 */
app.use("/api/telegram", require("./routes/telegramWebhook"));

/* ===============================
   HEALTH CHECK (monitoring)
=============================== */
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    service: "Lead Backend API",
    uptime: process.uptime(),
    time: new Date().toISOString(),
  });
});

/* ===============================
   ROOT (safe landing)
=============================== */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Lead backend running",
    endpoints: ["/api/leads", "/health"],
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

/* ===============================
   GLOBAL ERROR HANDLER
=============================== */
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.message || err);

  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

module.exports = app;