import express from "express";
import bot from "./config/telegram.config";

import "./bots/telegram.bootstrap";

import healthRoute from "./routes/health.route";
import stripeRoute from "./routes/stripe.route";
import telegramRoute from "./routes/telegram.route";

const app = express();

/* ===============================
   MIDDLEWARE
=============================== */
app.use("/stripe-webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "1mb" }));

/* ===============================
   ROUTES
=============================== */
app.use("/health", healthRoute);
app.use("/stripe", stripeRoute);
app.use("/telegram", telegramRoute);

/* ===============================
   EXPORT APP
=============================== */
export default app;