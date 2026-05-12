require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

/* ===============================
   TRUST PROXY (Render / Vercel safe)
=============================== */
app.set("trust proxy", 1);

/* ===============================
   SECURITY + PERFORMANCE HEADERS
=============================== */
app.disable("x-powered-by");

/* ===============================
   CORS CONFIG (PRODUCTION SAFE)
=============================== */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server or Postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || !process.env.FRONTEND_URL) {
        return callback(null, true);
      }

      return callback(new Error("CORS blocked"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

/* ===============================
   BODY PARSERS
=============================== */

// JSON for normal API routes
app.use(express.json({ limit: "1mb" }));

// Raw body ONLY for Stripe webhook (important fix pattern)
app.use("/api/webhook", express.raw({ type: "application/json" }));

/* ===============================
   ROUTES (CORE SYSTEM)
=============================== */

app.use("/api/payments", require("./routes/payments"));
app.use("/api/webhook", require("./routes/webhook"));

// 👉 NEW: Telegram control layer (if you added it)
app.use("/api/telegram", require("./routes/telegramWebhook"));

/* ===============================
   HEALTH CHECK
=============================== */
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "Flow OS Backend",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

/* ===============================
   ROOT
=============================== */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Flow OS backend running",
    version: "1.0.0",
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
  console.error("🔥 GLOBAL ERROR:", err);

  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

module.exports = app;