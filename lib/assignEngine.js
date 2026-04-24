import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function assignLead(lead) {

  const { data: agents } = await supabase
    .from("agents")
    .select("*")
    .eq("active", true);

  if (!agents || agents.length === 0) return null;

  const { data: last } = await supabase
    .from("lead_assignments")
    .select("agent_id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let index = 0;

  if (last) {
    const lastIndex = agents.findIndex(a => a.id === last.agent_id);
    index = (lastIndex + 1) % agents.length;
  }

  const agent = agents[index];

  await supabase.from("lead_assignments").insert([{
    lead_id: lead.id,
    agent_id: agent.id
  }]);

  await supabase
    .from("leads")
    .update({
      assigned_agent_id: agent.id,
      status: "assigned"
    })
    .eq("id", lead.id);

  return agent;
}