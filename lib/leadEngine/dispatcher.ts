import { supabase } from "@/lib/supabase";
import { claimLead } from "./claimLead";
import { assignLead } from "./assignLead";

const WORKER_ID =
  process.env.WORKER_ID ||
  `worker_${Math.random().toString(36).slice(2, 8)}`;

/* ===============================
   DISPATCHER (SAFETY-FIRST WORKER LOOP)
=============================== */
export async function runDispatcher(batchSize = 10) {
  const startedAt = Date.now();

  /* ===============================
     FETCH QUEUED + STUCK LEADS RECOVERY
  =============================== */
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .or("status.eq.queued,status.eq.processing")
    .limit(batchSize);

  if (!leads?.length) {
    return {
      worker: WORKER_ID,
      processed: 0,
      duration_ms: Date.now() - startedAt,
    };
  }

  /* ===============================
     FETCH ACTIVE CONTRACTORS
  =============================== */
  const { data: contractors } = await supabase
    .from("contractors")
    .select("*")
    .eq("active", true);

  let processed = 0;
  let failed = 0;

  /* ===============================
     PROCESS LOOP (SAFE + ISOLATED)
  =============================== */
  for (const lead of leads) {
    try {
      /* ---------- CLAIM STEP ---------- */
      const claimed = await claimLead(lead.id, WORKER_ID);

      if (!claimed) continue;

      /* ---------- ASSIGN STEP ---------- */
      await assignLead({
        lead: claimed,
        contractors: contractors || [],
        cityRow: null,
        systemMetrics: {
          demandMultiplier: 1,
        },
      });

      processed++;
    } catch (err) {
      failed++;

      console.error("Dispatcher error:", {
        leadId: lead.id,
        error: err?.message,
      });

      /* ===============================
         SAFE RECOVERY (PREVENT DEAD LEADS)
      =============================== */
      await supabase
        .from("leads")
        .update({
          status: "queued",
          locked_by: null,
          locked_at: null,
        })
        .eq("id", lead.id);
    }
  }

  /* ===============================
     OPTIONAL METRICS LOGGING
  =============================== */
  await supabase.from("dispatcher_logs").insert({
    worker_id: WORKER_ID,
    processed,
    failed,
    batch_size: batchSize,
    duration_ms: Date.now() - startedAt,
    created_at: new Date().toISOString(),
  });

  return {
    worker: WORKER_ID,
    processed,
    failed,
    duration_ms: Date.now() - startedAt,
  };
}