import { PLAN_RULES } from "../../engine/planRules";

export function getPlanFromSession(session) {
  // 1. STRIPE TRUTH LAYER (PRIMARY)
  const linkId =
    session.payment_link ||
    session.payment_link_id;

  const planFromStripe = Object.entries(PLAN_RULES).find(
    ([plan, config]) => config.stripeLink === linkId
  );

  if (planFromStripe) {
    return planFromStripe[0];
  }

  // 2. FALLBACK (ONLY FOR EDGE CASES / LOGGING)
  const metaPlan = session.metadata?.plan;

  if (metaPlan && PLAN_RULES[metaPlan]) {
    console.warn("⚠️ fallback plan used:", metaPlan);
    return metaPlan;
  }

  // 3. SAFE DEFAULT
  return "starter";
}