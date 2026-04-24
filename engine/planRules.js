// /engine/planRules.js

/**
 * RoofFlow OS - Plan Governance Layer
 * Controls routing, capacity, priority, and system limits per tier
 */

export const planRules = {
  starter: {
    // small contractor tier
    maxAgents: 1,
    maxDailyLeads: 20,
    priority: "low",
    autoAssign: true,
    queueDelayMs: 30000, // slower routing
    features: {
      aiRouting: false,
      priorityBoost: false,
      roundRobin: true,
      crmAccess: true
    }
  },

  pro: {
    // growing contractors
    maxAgents: 3,
    maxDailyLeads: 75,
    priority: "medium",
    autoAssign: true,
    queueDelayMs: 10000,
    features: {
      aiRouting: true,
      priorityBoost: false,
      roundRobin: true,
      crmAccess: true
    }
  },

  elite: {
    // high-volume teams
    maxAgents: 10,
    maxDailyLeads: 300,
    priority: "high",
    autoAssign: true,
    queueDelayMs: 0,
    features: {
      aiRouting: true,
      priorityBoost: true,
      roundRobin: true,
      crmAccess: true,
      realtimeDispatch: true
    }
  }
};

/**
 * Helper: get plan safely
 */
export function getPlanRules(plan = "starter") {
  return planRules[plan] || planRules.starter;
}

/**
 * Helper: check if org can receive lead
 */
export function canAcceptLead(plan, currentCount) {
  const rules = getPlanRules(plan);
  return currentCount < rules.maxDailyLeads;
}

/**
 * Helper: get routing priority weight
 */
export function getPriorityWeight(plan) {
  const rules = getPlanRules(plan);

  switch (rules.priority) {
    case "high":
      return 3;
    case "medium":
      return 2;
    default:
      return 1;
  }
}