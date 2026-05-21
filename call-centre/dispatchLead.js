const { routeWorkflow } = require("./workflows/router.workflow");

const DISPATCH_TIMEOUT_MS = 10000;
const MAX_RETRIES = 1;

/* ===============================
   TIMEOUT WRAPPER
=============================== */
function withTimeout(promise, ms) {
  let timer;

  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Dispatch timeout after ${ms}ms`));
    }, ms);
  });

  return Promise.race([promise, timeout]).finally(() => {
    clearTimeout(timer);
  });
}

/* ===============================
   VALIDATION
=============================== */
function validateLead(lead) {
  const required = ["source", "chatId", "text", "user"];

  const missing = required.filter((k) => !lead?.[k]);

  if (missing.length) {
    throw new Error(`Missing fields: ${missing.join(", ")}`);
  }
}

/* ===============================
   FEATURE EXTRACTION (ENHANCED)
=============================== */
function extractFeatures(lead) {
  const text = (lead.text || "").toLowerCase();

  return {
    urgency:
      lead.urgency ||
      (text.includes("urgent") || text.includes("asap")
        ? "high"
        : "medium"),

    type:
      lead.type ||
      (text.includes("roof") ? "roofing" : "general"),

    intent:
      text.includes("price") || text.includes("cost")
        ? "buyer"
        : text.includes("help")
        ? "support"
        : "info",
  };
}

/* ===============================
   LEAD SCORING (NEW)
=============================== */
function scoreLead(features) {
  let score = 50;

  if (features.urgency === "high") score += 30;
  if (features.intent === "buyer") score += 20;
  if (features.type === "roofing") score += 10;

  return Math.min(score, 100);
}

/* ===============================
   ROUTE PICKER (SMART ROUTING)
=============================== */
function pickRoute(features, score) {
  if (score >= 80) return "fastTrack";
  if (features.type === "roofing") return "contractorMatch";
  return "default";
}

/* ===============================
   EXECUTE ROUTE (EXTENSIBLE)
=============================== */
async function executeRoute(route, lead) {
  const result = await routeWorkflow(lead);

  return {
    routeResult: result,
  };
}

/* ===============================
   RETRY WRAPPER
=============================== */
async function runWithRetry(fn, retries = MAX_RETRIES) {
  let lastError;

  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}

/* ===============================
   MAIN DISPATCH ENGINE
=============================== */
async function dispatchLead(lead) {
  const startTime = Date.now();
  const ref = lead?.chatId || "unknown";

  try {
    validateLead(lead);

    const features = extractFeatures(lead);
    const score = scoreLead(features);
    const route = pickRoute(features, score);

    console.log(
      `[brain] route=${route} score=${score} ref=${ref}`
    );

    const result = await runWithRetry(() =>
      withTimeout(
        executeRoute(route, lead),
        DISPATCH_TIMEOUT_MS
      )
    );

    return {
      success: true,
      route,
      score,
      duration_ms: Date.now() - startTime,
      ...result,
    };
  } catch (err) {
    console.error(`[brain] failed ref=${ref} err=${err.message}`);

    return {
      success: false,
      error: err.message,
      duration_ms: Date.now() - startTime,
    };
  }
}

module.exports = { dispatchLead };