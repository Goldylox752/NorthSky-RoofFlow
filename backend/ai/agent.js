const { scoreLead, classifyLead } = require("./decisionEngine");
const { decideAction } = require("./actionEngine");

function runAgent(lead) {
  const score = scoreLead(lead);
  const classification = classifyLead(score);

  const decision = decideAction({
    score,
    classification,
    lead,
  });

  return {
    lead,
    score,
    classification,
    decision,
    timestamp: new Date().toISOString(),
  };
}

module.exports = { runAgent };