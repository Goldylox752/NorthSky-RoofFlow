import { supabase } from "@/lib/supabase";

const MAX_LOAD_PER_CONTRACTOR = 10;

function scoreContractor(c: any) {
  const performance = c.performance_score || 5;
  const speed = c.response_speed || 5;

  const loadPenalty = (c.current_load || 0) / MAX_LOAD_PER_CONTRACTOR;
  const failurePenalty = (c.failed_jobs || 0) * 0.5;

  const availabilityBonus =
    c.current_load < MAX_LOAD_PER_CONTRACTOR ? 2 : -5;

  return (
    performance * 2 +
    speed +
    availabilityBonus -
    loadPenalty * 5 -
    failurePenalty
  );
}

export async function pickContractor(city: string, contractors?: any[]) {
  let list = contractors;

  if (!list) {
    const { data } = await supabase
      .from("contractors")
      .select("*")
      .eq("active", true)
      .eq("city", city);

    list = data || [];
  }

  if (!list.length) return null;

  let best = null;
  let bestScore = -Infinity;

  for (const c of list) {
    const score = scoreContractor(c);
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }

  return best;
}