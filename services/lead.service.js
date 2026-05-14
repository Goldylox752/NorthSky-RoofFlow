// services/lead.service.js
import Lead from "../models/Lead.js";

export async function lockLead(leadId, userId) {
  return Lead.findByIdAndUpdate(
    leadId,
    {
      status: "locked",
      "lock.owner_id": userId,
      "lock.locked_at": new Date(),
      "lock.expires_at": new Date(Date.now() + 10 * 60 * 1000),
    },
    { new: true }
  );
}

export async function unlockAndSellLead(leadId, userId) {
  return Lead.findByIdAndUpdate(
    leadId,
    {
      status: "sold",
      buyer_id: userId,
      "stripe.paid": true,
      "stripe.paid_at": new Date(),
    },
    { new: true }
  );
}

export async function getLead(leadId) {
  return Lead.findById(leadId);
}