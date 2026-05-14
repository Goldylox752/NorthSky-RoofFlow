// services/payment.service.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createCheckoutSession({ lead, userId }) {
  return stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Lead: ${lead.category} - ${lead.city}`,
          },
          unit_amount: lead.price * 100,
        },
        quantity: 1,
      },
    ],

    metadata: {
      leadId: String(lead._id),
      userId: String(userId),
    },

    success_url: `${process.env.CLIENT_URL}/success`,
    cancel_url: `${process.env.CLIENT_URL}/cancel`,
  });
}