import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function trackUsage({
  contractorId,
  type,
  units,
  metadata = {},
}: {
  contractorId: string;
  type: string;
  units: number;
  metadata?: Record<string, any>;
}) {
  /* ===============================
     INSERT USAGE EVENT
  =============================== */
  const { error } = await supabase
    .from("usage_events")
    .insert({
      contractor_id: contractorId,
      usage_type: type,
      units,
      metadata,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error("usage tracking failed", error.message);
    throw error;
  }

  /* ===============================
     UPDATE LIVE TOTALS
  =============================== */
  await incrementUsageTotals({
    contractorId,
    type,
    units,
  });
}

async function incrementUsageTotals({
  contractorId,
  type,
  units,
}: {
  contractorId: string;
  type: string;
  units: number;
}) {
  const { data: existing } = await supabase
    .from("usage_totals")
    .select("*")
    .eq("contractor_id", contractorId)
    .eq("usage_type", type)
    .maybeSingle();

  if (!existing) {
    await supabase
      .from("usage_totals")
      .insert({
        contractor_id: contractorId,
        usage_type: type,
        total_units: units,
        updated_at: new Date().toISOString(),
      });

    return;
  }

  await supabase
    .from("usage_totals")
    .update({
      total_units: existing.total_units + units,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id);
}