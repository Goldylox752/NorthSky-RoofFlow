export const PRICING = {
  starter: {
    key: "starter",
    label: "Starter",
    price: 499,
    interval: "month",
    description: "5–10 qualified appointments",
    stripePriceId: process.env.STRIPE_PRICE_STARTER,
  },

  growth: {
    key: "growth",
    label: "Growth",
    price: 999,
    interval: "month",
    description: "15–30 booked appointments",
    featured: true,
    stripePriceId: process.env.STRIPE_PRICE_GROWTH,
  },

  domination: {
    key: "domination",
    label: "Domination",
    price: 1999,
    interval: "month",
    description: "High-volume + exclusive territory access",
    stripePriceId: process.env.STRIPE_PRICE_DOMINATION,
  },
};

// 🔒 helper (prevents invalid plan usage anywhere in app)
export function getPlan(planKey) {
  return PRICING[planKey] || null;
}

// 📊 optional helper for UI mapping
export function getAllPlans() {
  return Object.values(PRICING);
}
