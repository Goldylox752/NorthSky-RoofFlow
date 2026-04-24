import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/* =========================
   MAIN QUEUE LOOP (SAFE)
========================= */
export async function processQueue(org_id) {
  try {
    // 1. ROUTING RULES
    const { data: rules } = await supabase
      .from("routing_rules")
      .select("*")
      .eq("org_id", org_id)
      .maybeSingle();

    const routing = rules || {
      mode: "round_robin",
      priority_boost_enabled: true
    };

    // 2. FETCH QUEUED LEADS (LIMIT BATCH)
    const { data: queue } = await supabase
      .from("lead_queue")
      .select("*")
      .eq("org_id", org_id)
      .eq("status", "queued")
      .order("priority", { ascending: false })
      .limit(10);

    if (!queue?.length) return;

    // 3. FETCH AVAILABLE AGENTS
    const { data: agents } = await supabase
      .from("agents")
      .select("*")
      .eq("org_id", org_id)
      .eq("status", "online");

    if (!agents?.length) return;

    // 4. PROCESS LEADS SAFELY ONE-BY-ONE
    for (const leadItem of queue) {

      // 🔒 LOCK LEAD (prevents double assignment)
      const { data: locked } = await supabase
        .from("lead_queue")
        .update({ status: "processing" })
        .eq("id", leadItem.id)
        .eq("status", "queued")
        .select()
        .maybeSingle();

      if (!locked) continue; // already taken

      const agent = pickAgent(agents, routing);

      if (!agent) {
        // unlock if no agent
        await supabase
          .from("lead_queue")
          .update({ status: "queued" })
          .eq("id", leadItem.id);

        continue;
      }

      // capacity check
      if (agent.active_leads >= agent.capacity) {
        await supabase
          .from("lead_queue")
          .update({ status: "queued" })
          .eq("id", leadItem.id);

        continue;
      }

      await assignLeadToAgent({
        leadItem,
        agent,
        org_id,
        routing
      });
    }

  } catch (err) {
    console.error("QUEUE ERROR:", err);
  }
}

/* =========================
   AGENT PICKER
========================= */
function pickAgent(agents, routing) {
  const available = [...agents].sort(
    (a, b) => (a.active_leads || 0) - (b.active_leads || 0)
  );

  switch (routing.mode) {

    case "round_robin":
      return available[0];

    case "weighted":
      return available.sort(
        (a, b) =>
          (a.capacity - a.active_leads) -
          (b.capacity - b.active_leads)
      )[0];

    case "ai_priority":
      return available.sort(
        (a, b) =>
          (b.capacity - b.active_leads) -
          (a.capacity - a.active_leads)
      )[0];

    default:
      return available[0];
  }
}

/* =========================
   SAFE ASSIGNMENT ENGINE
========================= */
async function assignLeadToAgent({
  leadItem,
  agent,
  org_id,
  routing
}) {
  try {
    // 1. ASSIGN LEAD
    await supabase
      .from("lead_queue")
      .update({
        status: "assigned",
        assigned_agent_id: agent.id,
        assigned_at: new Date().toISOString()
      })
      .eq("id", leadItem.id);

    // 2. ATOMIC AGENT LOAD UPDATE
    await supabase.rpc("increment_agent_load", {
      agent_id: agent.id
    });

    // 3. ASSIGNMENT HISTORY
    await supabase.from("assignment_history").insert({
      org_id,
      lead_id: leadItem.lead_id,
      agent_id: agent.id,
      method: routing.mode,
      created_at: new Date().toISOString()
    });

    // 4. REALTIME EVENT
    await supabase.from("events").insert({
      type: "lead_assigned",
      org_id,
      payload: {
        lead_id: leadItem.lead_id,
        agent_id: agent.id
      }
    });

    console.log(
      `✅ Assigned lead ${leadItem.lead_id} → ${agent.name}`
    );

  } catch (err) {
    console.error("ASSIGNMENT ERROR:", err);

    // rollback safe state
    await supabase
      .from("lead_queue")
      .update({ status: "queued" })
      .eq("id", leadItem.id);
  }
}