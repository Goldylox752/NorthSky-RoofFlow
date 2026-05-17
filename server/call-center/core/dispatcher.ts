import { scoreLead } from "../agents/scoring.model";
import { routeLead } from "../core/rules.engine";

import { SMSAction } from "../actions/sms.action";
import { CallAction } from "../actions/call.action";
import { AssignAction } from "../actions/assign.action";

import { trackUsage } from "@/server/billing/metering/services/metering.service";

/* ===============================
   LEAD DISPATCH ENGINE
=============================== */
export async function dispatchLead(lead: any) {
  try {
    /* ===============================
       1. SCORE
    =============================== */
    const score = await scoreLead(lead);

    const enrichedLead = {
      ...lead,
      score,
    };

    /* ===============================
       2. ROUTE DECISION
    =============================== */
    const decision = routeLead(enrichedLead);

    if (!decision?.type) {
      throw new Error("No routing decision returned");
    }

    /* ===============================
       3. METRICS (IMPORTANT)
    =============================== */
    await trackUsage({
      contractorId: lead.contractor_id,
      type: "lead_dispatch",
      units: 1,
      metadata: {
        decision: decision.type,
        score,
      },
    });

    /* ===============================
       4. EXECUTE ACTION (DECOUPLED)
    =============================== */
    const result = await executeAction(decision, lead);

    return {
      success: true,
      decision,
      result,
    };
  } catch (err: any) {
    console.error("[dispatchLead] failed:", err.message);

    return {
      success: false,
      error: err.message,
    };
  }
}

/* ===============================
   ACTION EXECUTOR (EXTENSIBLE)
=============================== */
async function executeAction(decision: any, lead: any) {
  const { type, contractor } = decision;

  const actions: Record<string, Function> = {
    SMS: SMSAction,
    CALL: CallAction,
    ASSIGN: AssignAction,
  };

  const action = actions[type];

  if (!action) {
    throw new Error(`Unknown action type: ${type}`);
  }

  return await action(contractor, lead);
}