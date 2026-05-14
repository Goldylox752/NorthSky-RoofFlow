const leads = [
  { id: 1, name: "Roofing Calgary", price: 49 },
  { id: 2, name: "HVAC Toronto", price: 79 }
];

function getLeads() {
  return leads;
}

function getLead(id) {
  return leads.find(l => l.id === Number(id));
}

module.exports = { getLeads, getLead };