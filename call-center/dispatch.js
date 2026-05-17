const { routeWorkflow } = require("./workflows/router.workflow");

async function dispatchLead(lead) {
  try {
    return await routeWorkflow(lead);
  } catch (err) {
    console.error("[dispatch] failed", err.message);

    return {
      success: false,
      error: err.message,
    };
  }
}

module.exports = { dispatchLead };