function createEvent({ type, lead, decision = null, metadata = {} }) {
  if (!type) throw new Error("Event type required");
  if (!lead) throw new Error("Lead required");

  return {
    id: generateId(),
    type,
    lead,
    decision,
    metadata,
    timestamp: new Date().toISOString(),
  };
}

function generateId() {
  return (
    "evt_" +
    Math.random().toString(36).substring(2, 10) +
    Date.now().toString(36)
  );
}

module.exports = {
  createEvent,
};