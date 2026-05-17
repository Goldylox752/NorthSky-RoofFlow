const supabase = require("../../db/supabase");
const { runLeadWorkflow } = require("../runners/lead.runner");

const BATCH_SIZE = 25;

async function processLeadQueue() {
  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .eq("status", "queued")
    .limit(BATCH_SIZE);

  if (error) {
    console.error(error);
    return;
  }

  if (!leads?.length) return;

  await Promise.all(
    leads.map(async (lead) => {
      try {
        await lockLead(lead.id);

        await runLeadWorkflow(lead);

        await completeLead(lead.id);
      } catch (err) {
        console.error("Lead failed:", lead.id);

        await failLead(lead.id, err.message);
      }
    })
  );
}

async function lockLead(id) {
  await supabase
    .from("leads")
    .update({
      status: "processing",
      processing_started_at: new Date(),
    })
    .eq("id", id);
}

async function completeLead(id) {
  await supabase
    .from("leads")
    .update({
      status: "completed",
      completed_at: new Date(),
    })
    .eq("id", id);
}

async function failLead(id, reason) {
  await supabase
    .from("leads")
    .update({
      status: "failed",
      error_message: reason,
    })
    .eq("id", id);
}

module.exports = {
  processLeadQueue,
};