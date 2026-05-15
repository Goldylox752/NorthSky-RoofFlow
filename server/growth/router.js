function routeLead(lead) {
  if (lead.intentScore > 80) return "email_priority";
  if (lead.intentScore > 50) return "email_standard";
  return "nurture";
}

module.exports = { routeLead };