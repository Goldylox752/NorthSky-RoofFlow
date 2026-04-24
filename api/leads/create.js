export async function assignLead({ lead, org_id, supabase, orgContext }) {

  const { routing_mode, priority_level, max_agents } = orgContext;

  // =========================
  // 1. GET AVAILABLE AGENTS
  // =========================
  const { data: agents } = await supabase
    .from("agents")
    .select("*")
    .eq("org_id", org_id)
    .eq("status", "online");

  if (!agents?.length) return null;

  // =========================
  // 2. ROUTING LOGIC BY PLAN
  // =========================

  let selectedAgent;

  // 🟢 STARTER
  if (routing_mode === "basic_round_robin") {
    selectedAgent = agents[0];
  }

  // 🟡 PRO
  if (routing_mode === "balanced") {
    selectedAgent = agents.sort((a, b) => a.load - b.load)[0];
  }

  // 🔴 ELITE (FASTEST + LOWEST LOAD + PRIORITY BOOST)
  if (routing_mode === "ai_priority") {
    selectedAgent = agents
      .sort((a, b) =>
        (a.load + a.priority_penalty) - (b.load + b.priority_penalty)
      )[0];
  }

  // =========================
  // 3. UPDATE LEAD
  // =========================
  await supabase.from("leads").update({
    status: "assigned",
    assigned_agent_id: selectedAgent.id
  }).eq("id", lead.id);

  return {
    agent_id: selectedAgent.id,
    agent_name: selectedAgent.name
  };
}