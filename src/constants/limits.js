// src/constants/limits.js

const LIMITS = {
  starter: {
    leads_per_month: 100,
    automation_rules: 3,
    telegram_bots: 1,
  },

  growth: {
    leads_per_month: 1000,
    automation_rules: 20,
    telegram_bots: 3,
  },

  elite: {
    leads_per_month: Infinity,
    automation_rules: Infinity,
    telegram_bots: Infinity,
  },
};

/**
 * Get limit for a specific plan + key safely
 */
function getLimit(plan, key) {
  const p = plan?.toLowerCase();
  return LIMITS?.[p]?.[key] ?? 0;
}

/**
 * Get full limits for a plan
 */
function getPlanLimits(plan) {
  const p = plan?.toLowerCase();
  return LIMITS?.[p] || {};
}

module.exports = {
  LIMITS,
  getLimit,
  getPlanLimits,
};