const PLANS = {
  starter: "starter",
  growth: "growth",
  elite: "elite",
};

const FEATURES = {
  ai_scoring: {
    starter: true,
    growth: true,
    elite: true,
  },

  lead_export: {
    starter: false,
    growth: true,
    elite: true,
  },

  priority_routing: {
    starter: false,
    growth: true,
    elite: true,
  },

  api_access: {
    starter: false,
    growth: false,
    elite: true,
  },

  automation_engine: {
    starter: false,
    growth: true,
    elite: true,
  },

  multi_workspace: {
    starter: false,
    growth: false,
    elite: true,
  },

  webhook_access: {
    starter: true,
    growth: true,
    elite: true,
  },
};