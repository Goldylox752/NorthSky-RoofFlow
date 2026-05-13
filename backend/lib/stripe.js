const Stripe = require("stripe");

const key = process.env.STRIPE_SECRET_KEY;

/* ===============================
   ENV VALIDATION (FAIL FAST)
=============================== */
if (!key) {
  throw new Error("STRIPE_SECRET_KEY is missing in environment variables");
}

/* ===============================
   STRIPE CLIENT
=============================== */
const stripe = new Stripe(key, {
  apiVersion: "2024-06-20",
});

/* ===============================
   OPTIONAL DEBUG SAFETY (DEV ONLY)
=============================== */
if (process.env.NODE_ENV !== "production") {
  console.log("Stripe initialized in development mode");
}

module.exports = stripe;