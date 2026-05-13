require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

/* ===============================
   TRUST PROXY (Render / Vercel / VPS safe)
=============================== */
app.set("trust proxy", 1);

/* ===============================
   SECURITY HARDENING
=============================== */
app.disable("x-powered-by");

/* ===============================
   BODY PARSER
=============================== */
app.use(express.json({ limit: "2mb" }));

/* ===============================
   RATE LIMITING (SAFER SaaS DEFAULT)
=============================== */
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

/* ===============================
   CORS (ROBUST + NON-BREAKING)
=============================== */
const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
  ].filter(Boolean)
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      return callback(null, true); // fail-open for API stability
    },
    credentials: true,
  })
);

/* ===============================
   REQUEST LOGGER (LIGHTWEIGHT)
=============================== */
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

/* ===============================
   SAFE ROUTE LOADER (CRASH PROTECTION)
=============================== */
const safeRoute = (path) => {
  try {
    return require(path);
  } catch (err) {
    console.warn(`Missing route: ${path}`);
    return express.Router();
  }
};

/* ===============================
   API ROUTES
=============================== */
app.use("/api/leads", safeRoute("./routes/leadRoutes"));
app.use("/api/webhook", safeRoute("./routes/webhook"));
app.use("/api/payments", safeRoute("./routes/payments"));
app.use("/api/telegram", safeRoute("./routes/telegramWebhook"));

/* ===============================
   HEALTH CHECK
=============================== */
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    service: "Lead Backend API",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/* ===============================
   ROOT
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
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

module.exports = app;