const FEATURES = {
  starter: {
    ai_scoring: true,
    lead_export: false,
    priority_routing: false,
    api_access: false,
  },
  growth: {
    ai_scoring: true,
    lead_export: true,
    priority_routing: true,
    api_access: false,
  },
  elite: {
    ai_scoring: true,
    lead_export: true,
    priority_routing: true,
    api_access: true,
  },
};

const PLAN_LEVEL = {
  starter: 1,
  growth: 2,
  elite: 3,
};

/* ===============================
   NORMALIZE (SAFE INPUT LAYER)
=============================== */
function normalizePlan(plan) {
  if (typeof plan !== "string") return "starter";

  const cleaned = plan.toLowerCase().trim();

  return FEATURES[cleaned] ? cleaned : "starter";
}

/* ===============================
   GET PLAN OBJECT
=============================== */
function getPlan(plan) {
  return FEATURES[normalizePlan(plan)];
}

/* ===============================
   FEATURE CHECK (FAST PATH)
=============================== */
function hasFeature(plan, feature) {
  const normalized = normalizePlan(plan);
  return FEATURES[normalized]?.[feature] === true;
}

/* ===============================
   PLAN LEVEL CHECK (UPGRADES)
=============================== */
function hasPlanAccess(userPlan, requiredPlan) {
  const userLevel = PLAN_LEVEL[normalizePlan(userPlan)] || 0;
  const requiredLevel = PLAN_LEVEL[normalizePlan(requiredPlan)] || 1;

  return userLevel >= requiredLevel;
}

/* ===============================
   FEATURE GUARD MIDDLEWARE
=============================== */
function requireFeature(feature) {
  return (req, res, next) => {
    const plan = req.user?.plan;

    if (!hasFeature(plan, feature)) {
      return res.status(403).json({
        success: false,
        error: "FEATURE_NOT_AVAILABLE",
        feature,
        plan: normalizePlan(plan),
      });
    }

    next();
  };
}

/* ===============================
   PLAN GUARD MIDDLEWARE
=============================== */
function requirePlan(requiredPlan) {
  return (req, res, next) => {
    const userPlan = req.user?.plan;

    if (!hasPlanAccess(userPlan, requiredPlan)) {
      return res.status(403).json({
        success: false,
        error: "PLAN_UPGRADE_REQUIRED",
        currentPlan: normalizePlan(userPlan),
        requiredPlan: normalizePlan(requiredPlan),
      });
    }

    next();
  };
}

/* ===============================
   VALIDATION HELPERS
=============================== */
function isValidFeature(feature) {
  return typeof feature === "string" && feature in FEATURES.starter;
}

module.exports = {
  FEATURES,
  PLAN_LEVEL,
  normalizePlan,
  getPlan,
  hasFeature,
  hasPlanAccess,
  requireFeature,
  requirePlan,
  isValidFeature,
};