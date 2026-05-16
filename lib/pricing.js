import crypto from "crypto";
import {
  calculateFinalPrice,
  calculateLeadValue,
} from "@/lib/pricingEngine";
import { getDemandMultiplier } from "@/lib/demandEngine";
import { getCityScarcityFactor } from "@/lib/cityPricing";

// ===============================
// CONFIG (SOURCE OF TRUTH)
// ===============================
const PRICE_LIMITS = {
  min: 50,
  max: 5000,
};

// ===============================
// HASH UTILITY
// ===============================
function hashInput(input: unknown) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(input))
    .digest("hex")
    .slice(0, 12);
}

// ===============================
// SAFE NUMBER
// ===============================
function safeNumber(value: any, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// ===============================
// MAIN ENGINE
// ===============================
export function lockLeadPrice({
  lead = {},
  contractor = {},
  cityRow = {},
  systemMetrics = {},
}) {
  // ===============================
  // BASE VALUE
  // ===============================
  const baseLeadValue = calculateLeadValue(
    safeNumber(lead.score),
    contractor.city_tier || "basic"
  );

  // ===============================
  // MARKET FACTORS
  // ===============================
  const demandMultiplier = getDemandMultiplier(systemMetrics);

  const cityScarcity = getCityScarcityFactor(cityRow);

  // ===============================
  // FINAL PRICE
  // ===============================
  let finalPrice = calculateFinalPrice({
    baseLeadValue,
    demandMultiplier,
    contractorTier: contractor.plan || "basic",
    cityScarcity,
  });

  // ===============================
  // SAFETY CLAMP
  // ===============================
  finalPrice = Math.max(
    PRICE_LIMITS.min,
    Math.min(finalPrice, PRICE_LIMITS.max)
  );

  finalPrice = Math.round(finalPrice);

  // ===============================
  // AUDIT
  // ===============================
  const breakdown = Object.freeze({
    baseLeadValue,
    demandMultiplier,
    cityScarcity,
    contractorTier: contractor.plan || "basic",
  });

  const priceHash = hashInput({
    leadId: lead.id,
    finalPrice,
    breakdown,
  });

  return Object.freeze({
    finalPrice,
    breakdown,
    priceHash,
    lockedAt: new Date().toISOString(),
  });
}