const FEATURES = {
  starter: {
    lead_export: false,
    ai_scoring: true,
    priority_routing: false,
  },

  growth: {
    lead_export: true,
    ai_scoring: true,
    priority_routing: true,
  },

  elite: {
    lead_export: true,
    ai_scoring: true,
    priority_routing: true,
    api_access: true,
  },
};

module.exports = FEATURES;