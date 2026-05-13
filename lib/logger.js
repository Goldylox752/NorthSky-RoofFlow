const pino = require("pino");

/* ===============================
   BASE LOGGER CONFIG
=============================== */
const isProd = process.env.NODE_ENV === "production";

/* ===============================
   CORE LOGGER
=============================== */
const logger = pino({
  level: isProd ? "info" : "debug",

  base: {
    service: "saas-backend",
    env: process.env.NODE_ENV || "development",
  },

  timestamp: pino.stdTimeFunctions.isoTime,
});

/* ===============================
   CONTEXT LOGGER (REQUEST AWARE)
=============================== */
logger.withContext = (context = {}) => {
  return logger.child(context);
};

/* ===============================
   BUSINESS EVENT LOGGER (SAAS CORE)
=============================== */
logger.event = (eventName, data = {}) => {
  logger.info(
    {
      event: eventName,
      ...data,
    },
    "business_event"
  );
};

/* ===============================
   STRIPE LOGGER
=============================== */
logger.stripe = (event, data = {}) => {
  logger.info(
    {
      source: "stripe",
      event,
      ...data,
    },
    "stripe_event"
  );
};

/* ===============================
   LEAD LOGGER
=============================== */
logger.lead = (action, data = {}) => {
  logger.info(
    {
      module: "leads",
      action,
      ...data,
    },
    "lead_event"
  );
};

/* ===============================
   ERROR LOGGER (STANDARDIZED)
=============================== */
logger.errorLog = (err, context = {}) => {
  logger.error(
    {
      message: err?.message,
      stack: err?.stack,
      ...context,
    },
    "error_event"
  );
};

/* ===============================
   PERFORMANCE LOGGER
=============================== */
logger.performance = (label, ms, meta = {}) => {
  logger.info(
    {
      metric: "performance",
      label,
      ms,
      ...meta,
    },
    "performance_event"
  );
};

module.exports = logger;