const supabase = require("../lib/supabase");

/* ===============================
   COMMAND ROUTER
=============================== */

async function handleTelegramCommand(text) {
  const [cmd, ...args] = text.split(" ");

  switch (cmd) {
    case "/stats":
      return getStats();

    case "/lead":
      return getLead(args[0]);

    case "/assign":
      return assignLead(args[0], args[1]);

    case "/refund":
      return refundLead(args[0]);

    default:
      return "Unknown command";
  }
}

/* ===============================
   COMMANDS
=============================== */

async function getStats() {
  const { data } = await supabase
    .from("payments")
    .select("amount, created_at");

  const revenue = data.reduce((a, b) => a + Number(b.amount), 0);

  return `📊 Stats\n💰 Revenue: $${revenue.toFixed(2)}\n📈 Orders: ${data.length}`;
}

async function getLead(id) {
  const { data } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) return "Lead not found";

  return `🧾 Lead\nID: ${data.id}\nEmail: ${data.email}\nScore: ${data.score}`;
}

async function assignLead(leadId, contractorId) {
  await supabase
    .from("leads")
    .update({
      assigned_contractor_id: contractorId,
      status: "assigned",
    })
    .eq("id", leadId);

  return `⚡ Assigned ${leadId} → ${contractorId}`;
}

async function refundLead(leadId) {
  await supabase
    .from("leads")
    .update({
      status: "refunded",
    })
    .eq("id", leadId);

  return `💸 Refund flagged for ${leadId}`;
}

module.exports = { handleTelegramCommand };