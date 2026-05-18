const { routeWorkflow } = require("./workflows/router.workflow");

const DISPATCH_TIMEOUT_MS = 10000;

/* =========================================================
   MEMORY (lightweight learning store)
   Later move to DB/Redis
========================================================= */
const ROUTE_STATS = {
  success: {},
  failure: {},
  latency: {},
};

/* =========================================================
   TIMEOUT WRAPPER
========================================================= */
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

/* =========================================================
   VALIDATION
========================================================= */
function validateLead(lead) {
  const required = ["source", "chatId", "text", "user"];

  const missing = required.filter((k) => !lead?.[k]);

  if (missing.length) {
    throw new Error(`Missing fields: ${missing.join(", ")}`);
  }
}

/* =========================================================
   FEATURE EXTRACTION (BRAIN INPUT)
========================================================= */
function extractFeatures(lead) {
  return {
    city: (lead.city || "").toLowerCase(),
    type: (lead.type || "").toLowerCase(),
    urgency: (lead.urgency || "medium").toLowerCase(),
    hasPhone: !!lead.hasPhone,
  };
}

/* =========================================================
   ROUTE SCORING (MULTI-ROUTE AI BRAIN)
========================================================= */
function scoreRoute(routeName, features) {
  let score = 0;

  // learn from history
  const success = ROUTE_STATS.success[routeName] || 1;
  const failure = ROUTE_STATS.failure[routeName] || 1;
  const latency = ROUTE_STATS.latency[routeName] || 1000;

  const successRate = success / (success + failure);

  score += successRate * 50;              // reliability
  score -= failure * 2;                  // penalty
  score -= latency / 100;                // speed penalty

  // feature bias (adaptive routing)
  if (features.urgency === "high") {
    score += routeName === "fastTrack" ? 20 : 5;
  }

  if (features.type === "roofing") {
    score += routeName === "contractorMatch" ? 25 : 5;
  }

  return score;
}

/* =========================================================
   BRAIN DECISION ENGINE
========================================================= */
function pickBestRoute(features) {
  const routes = [
    "routeWorkflow",       // default
    "fastTrack",           // urgent simple flow
    "contractorMatch",     // high value leads
    "aiOptimizer",         // premium logic path
  ];

  let bestRoute = "routeWorkflow";
  let bestScore = -Infinity;

  for (const route of routes) {
    const score = scoreRoute(route, features);

    if (score > bestScore) {
      bestScore = score;
      bestRoute = route;
    }
  }

  return {
    route: bestRoute,
    confidence: Math.min(bestScore / 100, 1),
  };
}

/* =========================================================
   EXECUTE ROUTE
========================================================= */
async function executeRoute(route, lead) {
  const start = Date.now();

  let result;

  switch (route) {
    case "routeWorkflow":
      result = await routeWorkflow(lead);
      break;

    case "fastTrack":
      result = await routeWorkflow(lead); // placeholder optimized path
      break;

    case "contractorMatch":
      result = await routeWorkflow(lead); // future upgrade hook
      break;

    case "aiOptimizer":
      result = await routeWorkflow(lead); // future ML model hook
      break;

    default:
      result = await routeWorkflow(lead);
  }

  const duration = Date.now() - start;

  // update brain memory
  ROUTE_STATS.success[route] =
    (ROUTE_STATS.success[route] || 0) + 1;

  ROUTE_STATS.latency[route] = duration;

  return { result, duration };
}

/* =========================================================
   DISPATCH BRAIN (MAIN ENTRY)
========================================================= */
async function dispatchLead(lead) {
  const startTime = Date.now();

  const ref =
    lead?.metadata?.messageId ||
    lead?.chatId ||
    "unknown";

  try {
    validateLead(lead);

    const features = extractFeatures(lead);

    const decision = pickBestRoute(features);

    console.log(
      `[brain] route=${decision.route} confidence=${decision.confidence.toFixed(2)} ref=${ref}`
    );

    const { result, duration } = await withTimeout(
      executeRoute(decision.route, lead),
      DISPATCH_TIMEOUT_MS
    );

    return {
      success: true,
      leadId: result?.leadId || `LEAD-${Date.now()}`,
      route: decision.route,
      confidence: decision.confidence,
      duration_ms: Date.now() - startTime,
      internal_duration_ms: duration,
      ...result,
    };
  } catch (err) {
    const duration = Date.now() - startTime;

    // failure learning
    ROUTE_STATS.failure["routeWorkflow"] =
      (ROUTE_STATS.failure["routeWorkflow"] || 0) + 1;

    console.error(`[brain] failed ref=${ref} err=${err.message}`);

    return {
      success: false,
      leadId: null,
      error: err.message,
      duration_ms: duration,
    };
  }
}

module.exports = { dispatchLead };