const { scoreLead } = require("./scoring.model");
const { routeLead } = require("./rules.engine");

const { sendSMS } = require("../actions/sms.action");
const { triggerCall } = require("../actions/call.action");
const { assignLead } = require("../actions/assign.action");

async function dispatchLead(lead) {
  try {
    /* ===============================
       1. SCORE LEAD (AI LOGIC)
    =============================== */
    const score = scoreLead(lead);

    const enrichedLead = {
      ...lead,
      score,
    };

    /* ===============================
       2. DECIDE ROUTING (AI DECISION)
    =============================== */
    const decision = routeLead(enrichedLead);

    /*
      decision example:
      {
        type: "SMS" | "CALL" | "HOLD",
        contractor: {},
        priority: "high"
      }
    */

    /* ===============================
       3. EXECUTE ACTION
    =============================== */
    switch (decision.type) {
      case "SMS":
        await sendSMS(decision.contractor, lead);
        break;

      case "CALL":
        await triggerCall(decision.contractor, lead);
        break;

      case "ASSIGN":
        await assignLead(decision.contractor, lead);
        break;

      case "HOLD":
        console.log("Lead held for retry:", lead.id);
        break;
    }

    return {
      success: true,
      decision,
    };
  } catch (err) {
    console.error("Dispatch failed:", err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

module.exports = { dispatchLead };