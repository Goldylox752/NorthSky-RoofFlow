import { calculateFinalPrice } from "@/lib/pricingEngine";

/* ===============================
   BASE PRICE TIERS
=============================== */
const LEAD_BASE_BY_SCORE: Record<string, number> = {
  high: 5000,
  mid: 3000,
  low: 1500,
};

/* ===============================
   SAFE NUMERIC UTIL
=============================== */
function clamp(n: number, min: number, max: number) {
  const value = Number(n);
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/* ===============================
   SCORE → BASE VALUE
=============================== */
function getBaseLeadValue(score: number) {
  if (score >= 8) return LEAD_BASE_BY_SCORE.high;
  if (score >= 6) return LEAD_BASE_BY_SCORE.mid;
  return LEAD_BASE_BY_SCORE.low;
}

/* ===============================
   CORE PRICE LOCK ENGINE
=============================== */
export function lockLeadPrice({
  lead,
  contractor,
  cityRow,
  systemMetrics,
}: {
  lead: any;
  contractor: any;
  cityRow: any;
  systemMetrics: any;
}) {
  /* ===============================
     1. SCORE NORMALIZATION
  =============================== */
  const score = clamp(Number(lead?.score), 1, 10);

  /* ===============================
     2. BASE VALUE
  =============================== */
  const baseLeadValue = getBaseLeadValue(score);

  /* ===============================
     3. DEMAND MULTIPLIER
  =============================== */
  const demandMultiplier = clamp(
    Number(systemMetrics?.demandMultiplier),
    0.5,
    3
  );

  /* ===============================
     4. CONTRACTOR PLAN MULTIPLIER
  =============================== */
  const contractorTierMultiplier =
    contractor?.plan === "elite"
      ? 2.25
      : contractor?.plan === "growth"
      ? 1.5
      : 1;

  /* ===============================
     5. CITY SCARCITY MODEL
  =============================== */
  const capacity = Math.max(Number(cityRow?.capacity) || 1, 1);
  const active = Math.max(Number(cityRow?.active_contractors) || 0, 0);

  const saturation = active / capacity;

  const cityScarcityFactor =
    saturation >= 1.2
      ? 2.2
      : saturation >= 1
      ? 2.0
      : saturation >= 0.8
      ? 1.6
      : saturation >= 0.5
      ? 1.2
      : 1;

  /* ===============================
     6. FINAL RAW PRICE
  =============================== */
  const rawPrice = calculateFinalPrice({
    baseLeadValue,
    demandMultiplier,
    contractorTierMultiplier,
    cityScarcityFactor,
  });

  /* ===============================
     7. PRICE GOVERNANCE (ANTI-ABUSE)
  =============================== */
  const finalPrice = clamp(
    Math.round(rawPrice),
    750,
    25000
  );

  /* ===============================
     8. IMMUTABLE RETURN OBJECT
  =============================== */
  return Object.freeze({
    finalPrice,
    lockedAt: new Date().toISOString(),
    breakdown: {
      baseLeadValue,
      demandMultiplier,
      contractorTierMultiplier,
      cityScarcityFactor,
      saturation,
      rawPrice,
    },
  });
}