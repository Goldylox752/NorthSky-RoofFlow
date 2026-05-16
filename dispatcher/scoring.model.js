function scoreLead(lead) {
  let score = 0;

  if (lead.city === "Vancouver") score += 25;
  if (lead.type === "roofing") score += 30;
  if (lead.urgency === "high") score += 40;
  if (lead.hasPhone) score += 10;

  // AI-style weighting (future upgrade point)
  return score;
}

module.exports = { scoreLead };