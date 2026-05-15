function routeLead(lead) {
  if (lead.score > 80) return "email_priority";
  if (lead.score > 50) return "email_standard";
  return "nurture";
}

module.exports = { routeLead };