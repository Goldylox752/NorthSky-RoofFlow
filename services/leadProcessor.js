export function processLead(raw) {
  const emails =
    raw.emails?.filter(Boolean) || [];

  const phones =
    raw.phones?.filter(Boolean) || [];

  // 🧠 simple scoring system
  let score = 0;

  if (emails.length) score += 40;
  if (phones.length) score += 40;
  if (raw.title && raw.title.length > 5) score += 20;

  let tier = "C";

  if (score >= 80) tier = "A";
  else if (score >= 50) tier = "B";

  return {
    ...raw,
    emails,
    phones,
    score,
    tier,
    created_at: new Date().toISOString(),
  };
}
