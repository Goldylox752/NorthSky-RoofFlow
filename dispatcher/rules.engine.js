function routeLead(lead) {
  if (lead.score > 80) {
    return {
      type: "CALL",
      priority: "high",
      contractor: selectBestContractor(lead),
    };
  }

  if (lead.score > 50) {
    return {
      type: "SMS",
      contractor: selectBestContractor(lead),
    };
  }

  return {
    type: "HOLD",
  };
}

/* placeholder logic */
function selectBestContractor(lead) {
  return {
    id: "c1",
    phone: "+123456789",
  };
}

module.exports = { routeLead };