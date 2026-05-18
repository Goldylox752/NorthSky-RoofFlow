const { scoreLead } = require("../scoring.model");
const { routeLead } = require("../rules.engine");

const adminWorkflow = require("./admin.workflow");
const userWorkflow = require("./user.workflow");
const billingWorkflow = require("./billing.workflow");

// ── Intent keyword map — easy to extend ──────────────────────────────────────
const INTENT_MAP = [
  {
    intent: "ADMIN",
    keywords: ["admin", "administrator", "superuser", "override", "backdoor"],
  },
  {
    intent: "BILLING",
    keywords: ["invoice", "billing", "payment", "charge", "refund", "subscription", "plan", "pricing"],
  },
  {
    intent: "SUPPORT",
    keywords: ["help", "issue", "broken", "error", "not working", "bug", "fix"],
  },
  {
    intent: "SALES",
    keywords: ["buy", "purchase", "upgrade", "demo", "trial", "pricing", "quote"],
  },
];

const WORKFLOW_MAP = {
  ADMIN: adminWorkflow,
  BILLING: billingWorkflow,
  SUPPORT: userWorkflow,   // swap with supportWorkflow when ready
  SALES: userWorkflow,     // swap with salesWorkflow when ready
  USER: userWorkflow,
};

// ── Intent detection ─────────────────────────────────────────────────────────
function detectIntent(lead) {
  const text = (lead.text || "").toLowerCase();

  for (const { intent, keywords } of INTENT_MAP) {
    if (keywords.some((kw) => text.includes(kw))) {
      return intent;
    }
  }

  return "USER";
}

// ── Score tier for logging/decisions ─────────────────────────────────────────
function getScoreTier(score) {
  if (score >= 80) return "HOT";
  if (score >= 50) return "WARM";
  return "COLD";
}

// ── Main router ───────────────────────────────────────────────────────────────
async function routeWorkflow(lead) {
  const score = scoreLead(lead);
  const tier = getScoreTier(score);

  const enriched = {
    ...lead,
    score,
    tier,
    intent: null, // set below
    routedAt: new Date().toISOString(),
  };

  const decision = routeLead(enriched);
  const intent = detectIntent(enriched);

  enriched.intent = intent;

  console.log(
    `[router] source=${lead.source} intent=${intent} tier=${tier} score=${score} ref=${lead.metadata?.messageId ?? lead.chatId}`
  );

  const workflow = WORKFLOW_MAP[intent] ?? userWorkflow;

  const result = await workflow(enriched, decision);

  return {
    ...result,
    intent,
    tier,
    score,
  };
}

module.exports = { routeWorkflow };
