require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

/* ===============================
   TRUST PROXY (Render / SaaS safe)
=============================== */
app.set("trust proxy", 1);

/* ===============================
   SECURITY HEADERS
=============================== */
app.disable("x-powered-by");

/* ===============================
   RATE LIMIT (ANTI ABUSE)
=============================== */
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // requests per IP
});

app.use(limiter);

/* ===============================
   CORS (SAFER SAAS CONFIG)
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

      return callback(null, false);
    },
    credentials: true,
  })
);

/* ===============================
   BODY PARSING
=============================== */
app.use(express.json({ limit: "2mb" }));

/* ===============================
   REQUEST LOGGING (DEBUG SAFE)
=============================== */
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`);
  next();
});

/* ===============================
   ROUTES
=============================== */
app.use("/api/webhook", require("./routes/webhook"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/telegram", require("./routes/telegramWebhook"));

/* ===============================
   HEALTH CHECK
=============================== */
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    service: "Flow OS Backend",
    time: new Date().toISOString(),
  });
});

/* ===============================
   ROOT
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

/* ===============================
   GLOBAL ERROR HANDLER
=============================== */
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err);

  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

module.exports = app;