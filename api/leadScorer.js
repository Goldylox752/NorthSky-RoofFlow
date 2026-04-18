function scoreLead(lead) {
  let score = 0;

  // trust signals
  if (lead.rating >= 4.2) score += 20;
  if (lead.reviews > 50) score += 25;
  if (lead.reviews > 200) score += 35;

  // intent signals
  if ((lead.name || "").toLowerCase().includes("roof")) score += 20;
  if ((lead.name || "").toLowerCase().includes("construction")) score += 10;

  // geographic strength (adjust for your market)
  const hotCities = ["edmonton", "leduc", "calgary"];

  if (hotCities.some(c => (lead.address || "").toLowerCase().includes(c))) {
    score += 15;
  }

  return Math.min(score, 100);
}

module.exports = { scoreLead };