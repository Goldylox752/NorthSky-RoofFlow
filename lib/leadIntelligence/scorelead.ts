const HOT_CITIES = [
  "edmonton",
  "leduc",
  "calgary",
];

const HIGH_INTENT_KEYWORDS = [
  "roof",
  "roofing",
  "roof repair",
  "roof replacement",
  "shingles",
  "siding",
  "hail damage",
  "construction",
  "contractor",
  "renovation",
];

const SPAM_KEYWORDS = [
  "test",
  "fake",
  "demo",
  "sample",
];

function normalize(value?: string) {
  return (value || "").trim().toLowerCase();
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function scoreLead(lead: any) {
  let score = 0;

  const name = normalize(lead.name);
  const address = normalize(lead.address);
  const email = normalize(lead.email);
  const phone = normalize(lead.phone);
  const notes = normalize(lead.notes);

  const combinedText = `
    ${name}
    ${address}
    ${notes}
  `;

  /* ==================================================
     TRUST SIGNALS
  ================================================== */

  const rating = Number(lead.rating || 0);
  const reviews = Number(lead.reviews || 0);

  if (rating >= 4.0) score += 10;
  if (rating >= 4.5) score += 15;
  if (rating >= 4.8) score += 25;

  if (reviews >= 10) score += 5;
  if (reviews >= 50) score += 10;
  if (reviews >= 100) score += 15;
  if (reviews >= 250) score += 20;

  /* ==================================================
     CONTACT QUALITY
  ================================================== */

  if (email.includes("@")) {
    score += 10;
  }

  if (
    phone.length >= 10 &&
    /\d/.test(phone)
  ) {
    score += 10;
  }

  /* ==================================================
     INTENT SIGNALS
  ================================================== */

  for (const keyword of HIGH_INTENT_KEYWORDS) {
    if (combinedText.includes(keyword)) {
      score += 8;
    }
  }

  /* ==================================================
     GEO SIGNALS
  ================================================== */

  if (
    HOT_CITIES.some((city) =>
      address.includes(city)
    )
  ) {
    score += 15;
  }

  /* ==================================================
     BUSINESS QUALITY
  ================================================== */

  if (lead.website) {
    score += 10;
  }

  if (lead.verified === true) {
    score += 15;
  }

  if (
    lead.business_status ===
    "OPERATIONAL"
  ) {
    score += 10;
  }

  /* ==================================================
     RECENCY SIGNALS
  ================================================== */

  if (lead.last_activity_at) {
    const lastActivity =
      new Date(
        lead.last_activity_at
      ).getTime();

    const daysOld =
      (Date.now() - lastActivity) /
      (1000 * 60 * 60 * 24);

    if (daysOld <= 7) score += 15;
    else if (daysOld <= 30) score += 8;
  }

  /* ==================================================
     SPAM DETECTION
  ================================================== */

  for (const spam of SPAM_KEYWORDS) {
    if (combinedText.includes(spam)) {
      score -= 40;
    }
  }

  if (
    !email &&
    !phone
  ) {
    score -= 30;
  }

  if (
    rating > 0 &&
    reviews === 0
  ) {
    score -= 10;
  }

  /* ==================================================
     LOAD NORMALIZATION
  ================================================== */

  score = clamp(score);

  /* ==================================================
     LEAD TIERING
  ================================================== */

  let tier = "cold";

  if (score >= 80) tier = "hot";
  else if (score >= 55) tier = "warm";

  return {
    score,
    tier,

    breakdown: {
      rating,
      reviews,
      hasEmail: !!email,
      hasPhone: !!phone,
      cityBoost:
        HOT_CITIES.find((c) =>
          address.includes(c)
        ) || null,
    },
  };
}