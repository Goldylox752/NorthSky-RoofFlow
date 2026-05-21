const { routeWorkflow } = require("./workflows/router.workflow");

const DISPATCH_TIMEOUT_MS = 10000;

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
   FEATURE EXTRACTION (SIMPLE)
=============================== */
function extractFeatures(lead) {
  return {
    urgency: (lead.urgency || "medium").toLowerCase(),
    type: (lead.type || "general").toLowerCase(),
  };
}

/* ===============================
   ROUTE PICKER (SIMPLE MVP)
=============================== */
function pickRoute(features) {
  if (features.urgency === "high") {
    return "fastTrack";
  }

  if (features.type === "roofing") {
    return "contractorMatch";
  }

  return "default";
}

/* ===============================
   EXECUTE ROUTE
=============================== */
async function executeRoute(route, lead) {
  switch (route) {
    case "fastTrack":
      return routeWorkflow(lead);

    case "contractorMatch":
      return routeWorkflow(lead);

    default:
      return routeWorkflow(lead);
  }
}

/* ===============================
   MAIN DISPATCH
=============================== */
async function dispatchLead(lead) {
  const startTime = Date.now();

  const ref = lead?.chatId || "unknown";

  try {
    validateLead(lead);

    const features = extractFeatures(lead);

    const route = pickRoute(features);

    console.log(`[brain] route=${route} ref=${ref}`);

    const result = await withTimeout(
      executeRoute(route, lead),
      DISPATCH_TIMEOUT_MS
    );

    return {
      success: true,
      route,
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