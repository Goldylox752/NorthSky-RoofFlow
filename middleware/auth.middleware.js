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

function getPlan(plan) {
  return FEATURES[plan] || FEATURES.starter;
}

function hasFeature(plan, feature) {
  return Boolean(getPlan(plan)[feature]);
}