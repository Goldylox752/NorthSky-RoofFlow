import { supabase } from "@/lib/supabase";

/* ===============================
   GET SINGLE LEAD
=============================== */
export async function getLead(id: string) {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/* ===============================
   LOCK LEAD (ATOMIC CLAIM)
=============================== */
export async function lockLead(leadId: string, userId: string) {
  const { data, error } = await supabase
    .from("leads")
    .update({
      status: "locked",
      lock_owner: userId,
      locked_at: new Date().toISOString(),
      lock_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    })
    .eq("id", leadId)
    .eq("status", "new")
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/* ===============================
   SELL / FINALIZE LEAD
=============================== */
export async function sellLead(leadId: string, userId: string) {
  const { data, error } = await supabase
    .from("leads")
    .update({
      status: "sold",
      buyer_id: userId,
      "stripe.paid": true,
      "stripe.paid_at": new Date().toISOString(),
    })
    .eq("id", leadId)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}