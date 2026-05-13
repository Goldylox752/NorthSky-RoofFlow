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

/* ===============================
   SAFE PLAN RESOLUTION
=============================== */
const normalizePlan = (plan) => {
  if (!plan || typeof plan !== "string") return "starter";
  return plan.toLowerCase().trim();
};

/* ===============================
   PLAN PRIORITY (UPGRADE LOGIC)
=============================== */
const PLAN_LEVEL = {
  starter: 1,
  growth: 2,
  elite: 3,
};

/* ===============================
   GET PLAN FEATURES
=============================== */
const getPlan = (plan) => {
  const normalized = normalizePlan(plan);
  return FEATURES[normalized] || FEATURES.starter;
};

/* ===============================
   FEATURE CHECK
=============================== */
const hasFeature = (plan, feature) => {
  const features = getPlan(plan);
  return Boolean(features?.[feature]);
};

/* ===============================
   PLAN COMPARISON (IMPORTANT FOR SAAS)
=============================== */
const hasPlanAccess = (userPlan, requiredPlan) => {
  const userLevel = PLAN_LEVEL[normalizePlan(userPlan)] || 0;
  const requiredLevel = PLAN_LEVEL[normalizePlan(requiredPlan)] || 1;

  return userLevel >= requiredLevel;
};

/* ===============================
   FEATURE MIDDLEWARE (PRODUCTION SAFE)
=============================== */
const requireFeature = (feature) => {
  return (req, res, next) => {
    const plan = req.user?.plan;

    if (!hasFeature(plan, feature)) {
      return res.status(403).json({
        success: false,
        error: `Feature "${feature}" requires upgrade`,
        currentPlan: normalizePlan(plan),
        requiredFeature: feature,
      });
    }

    next();
  };
};

/* ===============================
   PLAN MIDDLEWARE (LEVEL-BASED)
=============================== */
const requirePlan = (requiredPlan) => {
  return (req, res, next) => {
    const userPlan = req.user?.plan;

    if (!hasPlanAccess(userPlan, requiredPlan)) {
      return res.status(403).json({
        success: false,
        error: "Upgrade required",
        currentPlan: normalizePlan(userPlan),
        requiredPlan: normalizePlan(requiredPlan),
      });
    }

    next();
  };
};

/* ===============================
   EXPORTS
=============================== */
module.exports = {
  FEATURES,
  getPlan,
  hasFeature,
  requireFeature,
  requirePlan,
  hasPlanAccess,
};