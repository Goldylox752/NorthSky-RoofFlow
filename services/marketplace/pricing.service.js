const BASE_MULTIPLIER = {
  roofing: 1.4,
  plumbing: 1.3,
  solar: 1.6,
  default: 1.2,
};

/**
 * Dynamic pricing engine (your profit lever)
 */
exports.calculateLeadPrice = (lead) => {
  const base = lead.score * 2; // base value per quality score

  const multiplier =
    BASE_MULTIPLIER[lead.category?.toLowerCase()] ||
    BASE_MULTIPLIER.default;

  const price = Math.round(base * multiplier);

  return Math.max(price, 5); // minimum $5
};