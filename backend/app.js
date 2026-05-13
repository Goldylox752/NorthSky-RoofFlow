require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

/* ===============================
   TRUST PROXY (Render / VPS / Cloud)
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
   RATE LIMITING (PRODUCTION SAFE)
=============================== */
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests",
  },
});

app.use(limiter);

/* ===============================
   CORS (PRODUCTION SAFE FIX)
=============================== */
const allowedOrigins = new Set(
  [process.env.FRONTEND_URL, "http://localhost:3000"].filter(Boolean)
);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server / curl / stripe webhooks
      if (!origin) return callback(null, true);

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      // IMPORTANT: fail CLOSED in production SaaS (security upgrade)
      return callback(new Error("CORS blocked"), false);
    },
    credentials: true,
  })
);

/* ===============================
   REQUEST LOGGER
=============================== */
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

/* ===============================
   SAFE ROUTE LOADER
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
   ROUTES
=============================== */
app.use("/api/leads", safeRoute("./routes/leadRoutes"));
app.use("/api/webhook", safeRoute("./routes/webhook"));
app.use("/api/payments", safeRoute("./routes/payments"));
app.use("/api/telegram", safeRoute("./routes/telegramWebhook"));

/* ===============================
   HEALTH CHECK
=============================== */
app.get("/health", (req, res) => {
  res.status(200).json({
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
  res.status(200).json({
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