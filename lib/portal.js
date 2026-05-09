const stripe = require("./stripe");

async function createPortalSession(customerId) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.CLIENT_URL}/dashboard`,
  });
}

module.exports = { createPortalSession };