const WEIGHTS = {
  city: {
    Vancouver: 25,
    Calgary: 20,
    Edmonton: 18,
  },

  type: {
    roofing: 30,
    siding: 20,
    renovation: 15,
    general: 5,
  },

  urgency: {
    high: 40,
    medium: 20,
    low: 5,
  },

  signals: {
    hasPhone: 10,
    hasEmail: 5,
    hasWebsite: 8,
  },
};

function clamp(score, min = 0, max = 100) {
  return Math.max(min, Math.min(max, score));
}

function normalize(value) {
  return (value || "").toString().toLowerCase();
}

function scoreLead(lead) {
  let score = 0;

  const city = normalize(lead.city);
  const type = normalize(lead.type);
  const urgency = normalize(lead.urgency);

  /* ===============================
     CITY SCORE
  =============================== */
  score += WEIGHTS.city[city] || 0;

  /* ===============================
     TYPE SCORE
  =============================== */
  score += WEIGHTS.type[type] || 0;

  /* ===============================
     URGENCY SCORE
  =============================== */
  score += WEIGHTS.urgency[urgency] || 0;

  /* ===============================
     CONTACT QUALITY
  =============================== */
  if (lead.hasPhone) score += WEIGHTS.signals.hasPhone;
  if (lead.hasEmail) score += WEIGHTS.signals.hasEmail;
  if (lead.hasWebsite) score += WEIGHTS.signals.hasWebsite;

  /* ===============================
     BONUS LOGIC (FUTURE AI HOOK)
  =============================== */

  if (lead.rating && lead.rating >= 4.5) {
    score += 10;
  }

  if (lead.reviews && lead.reviews > 50) {
    score += 5;
  }

  /* ===============================
     FINAL NORMALIZATION
  =============================== */
  return clamp(score);
}

module.exports = { scoreLead };