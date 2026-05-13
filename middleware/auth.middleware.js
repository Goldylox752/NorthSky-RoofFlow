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
   SAFE PLAN NORMALIZATION
=============================== */
const normalizePlan = (plan) => {
  if (!plan || typeof plan !== "string") return "starter";

  const cleaned = plan.toLowerCase().trim();

  // prevent invalid DB values from breaking SaaS
  if (!FEATURES[cleaned]) return "starter";

  return cleaned;
};

/* ===============================
   PLAN LEVEL SYSTEM
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
  return FEATURES[normalizePlan(plan)];
};

/* ===============================
   FEATURE CHECK (CORE SAFETY)
=============================== */
const hasFeature = (plan, feature) => {
  const normalized = normalizePlan(plan);
  const features = FEATURES[normalized];

  if (!features) return false;
  return features[feature] === true;
};

/* ===============================
   PLAN ACCESS CHECK
=============================== */
const hasPlanAccess = (userPlan, requiredPlan) => {
  const userLevel = PLAN_LEVEL[normalizePlan(userPlan)] || 0;
  const requiredLevel = PLAN_LEVEL[normalizePlan(requiredPlan)] || 1;

  return userLevel >= requiredLevel;
};

/* ===============================
   FEATURE MIDDLEWARE
=============================== */
const requireFeature = (feature) => {
  return (req, res, next) => {
    const plan = req.user?.plan;

    if (!hasFeature(plan, feature)) {
      return res.status(403).json({
        success: false,
        error: "Feature not available on your plan",
        feature,
        currentPlan: normalizePlan(plan),
      });
    }

    next();
  };
};

/* ===============================
   PLAN MIDDLEWARE
=============================== */
const requirePlan = (requiredPlan) => {
  return (req, res, next) => {
    const userPlan = req.user?.plan;

    if (!hasPlanAccess(userPlan, requiredPlan)) {
      return res.status(403).json({
        success: false,
        error: "Plan upgrade required",
        currentPlan: normalizePlan(userPlan),
        requiredPlan: normalizePlan(requiredPlan),
      });
    }

    next();
  };
};

/* ===============================
   FEATURE VALIDATION (SAAS SAFETY)
=============================== */
const isValidFeature = (feature) => {
  const starter = FEATURES.starter;
  return Object.prototype.hasOwnProperty.call(starter, feature);
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
  normalizePlan,
  isValidFeature,
};