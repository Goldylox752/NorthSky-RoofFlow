const DEFAULT_WEIGHTS = {
  city: {
    vancouver: 25,
    calgary: 20,
    edmonton: 18,
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

  trust: {
    ratingBoost: 10,
    reviewsBoost: 5,
  },
};

/* =========================================================
   UTILS
========================================================= */

function normalize(value) {
  return (value || "")
    .toString()
    .toLowerCase()
    .trim();
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

/* =========================================================
   FEATURE EXTRACTOR (future ML-ready)
========================================================= */

function extractLeadFeatures(lead) {
  return {
    city: normalize(lead.city),
    type: normalize(lead.type),
    urgency: normalize(lead.urgency),

    hasPhone: Boolean(lead.hasPhone),
    hasEmail: Boolean(lead.hasEmail),
    hasWebsite: Boolean(lead.hasWebsite),

    rating: Number(lead.rating || 0),
    reviews: Number(lead.reviews || 0),
  };
}

/* =========================================================
   CORE SCORING ENGINE
========================================================= */

function scoreLead(lead) {
  const f = extractLeadFeatures(lead);
  let score = 0;

  /* -------------------------------
     BASE CATEGORY SIGNALS
  ------------------------------- */
  score += DEFAULT_WEIGHTS.city[f.city] || 0;
  score += DEFAULT_WEIGHTS.type[f.type] || 0;
  score += DEFAULT_WEIGHTS.urgency[f.urgency] || 0;

  /* -------------------------------
     CONTACT QUALITY SIGNALS
  ------------------------------- */
  if (f.hasPhone) score += DEFAULT_WEIGHTS.signals.hasPhone;
  if (f.hasEmail) score += DEFAULT_WEIGHTS.signals.hasEmail;
  if (f.hasWebsite) score += DEFAULT_WEIGHTS.signals.hasWebsite;

  /* -------------------------------
     TRUST SIGNALS (business quality)
  ------------------------------- */
  if (f.rating >= 4.5) {
    score += DEFAULT_WEIGHTS.trust.ratingBoost;
  }

  if (f.reviews > 50) {
    score += DEFAULT_WEIGHTS.trust.reviewsBoost;
  }

  /* -------------------------------
     FUTURE AI HOOK (IMPORTANT)
     - later replace with ML model score
  ------------------------------- */
  // score += mlModel.predict(f);

  /* -------------------------------
     FINAL OUTPUT
  ------------------------------- */
  return clamp(score);
}

module.exports = {
  scoreLead,
};