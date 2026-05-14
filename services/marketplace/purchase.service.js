const { lockLead } = require("../lead/lock.service");
const { createCheckoutSession } = require("../payment/stripe.service");
const { logEvent } = require("../analytics/event.service");

/**
 * MAIN PURCHASE FLOW
 * This is the money pipeline entry point
 */
exports.createLeadPurchase = async ({ leadId, userId }) => {
  // 1. LOCK LEAD (prevents double selling)
  const lead = await lockLead(leadId, userId);

  if (!lead) {
    throw new Error("Lead is already locked or sold");
  }

  // 2. LOG MARKETPLACE EVENT
  await logEvent({
    type: "locked",
    leadId,
    userId,
    meta: {
      price: lead.price,
      city: lead.city,
      category: lead.category,
    },
  });

  // 3. CREATE STRIPE CHECKOUT SESSION
  const session = await createCheckoutSession({
    lead,
    userId,
  });

  // 4. RETURN PAYMENT LINK
  return {
    checkoutUrl: session.url,
    sessionId: session.id,
    leadId: lead.id,
    price: lead.price,
  };
};