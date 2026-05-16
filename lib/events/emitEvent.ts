import { supabase } from "@/lib/supabase";

export async function emitEvent({
  type,
  leadId,
  contractorId,
  city,
  metadata = {},
}: {
  type: string;
  leadId?: string;
  contractorId?: string;
  city?: string;
  metadata?: Record<string, any>;
}) {
  await supabase.from("events").insert({
    type,
    lead_id: leadId,
    contractor_id: contractorId,
    city,
    metadata,
    created_at: new Date().toISOString(),
  });
}