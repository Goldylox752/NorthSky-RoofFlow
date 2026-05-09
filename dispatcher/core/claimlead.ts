import { supabase } from "@/lib/supabase";

export async function claimLead(leadId: string, workerId: string) {
  if (!leadId || !workerId) {
    throw new Error("Missing leadId or workerId");
  }

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("leads")
    .update({
      status: "processing",
      locked_by: workerId,
      locked_at: now,
    })
    .eq("id", leadId)
    .eq("status", "queued")
    .select()
    .single();

  /* ===============================
     HANDLE RACE CONDITION CLEANLY
  =============================== */
  if (error) {
    console.warn("Lead claim failed:", {
      leadId,
      workerId,
      error: error.message,
    });

    return null;
  }

  if (!data) {
    console.warn("Lead already claimed or not available:", {
      leadId,
      workerId,
    });

    return null;
  }

  return data;
}