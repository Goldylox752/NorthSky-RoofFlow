import { supabase } from "@/lib/supabase";
import { lockLeadPrice } from "./lockLeadPrice";
import { routeLead } from "./routeLead";

export async function assignLead({
  lead,
  contractors,
  cityRow,
  systemMetrics,
}) {
  if (!lead?.id) throw new Error("Missing lead");

  /* ===============================
     ROUTE CONTRACTOR
  =============================== */
  const contractor = routeLead(lead, contractors);

  if (!contractor || !contractor.id) {
    throw new Error("No available contractor found");
  }

  /* ===============================
     PRICE LOCK
  =============================== */
  const price = lockLeadPrice({
    lead,
    contractor,
    cityRow,
    systemMetrics,
  });

  if (!price?.final_price) {
    throw new Error("Price calculation failed");
  }

  /* ===============================
     SAFE UPDATE (ATOMIC GUARD)
  =============================== */
  const { data, error } = await supabase
    .from("leads")
    .update({
      status: "assigned",
      assigned_contractor_id: contractor.id,
      final_price: price.final_price,
      price_locked_at: price.price_locked_at,
    })
    .eq("id", lead.id)
    .eq("status", "processing")
    .select()
    .single();

  if (error) {
    throw new Error("Lead assignment failed or already processed");
  }

  /* ===============================
     OPTIONAL: AUDIT LOG (RECOMMENDED)
  =============================== */
  await supabase.from("lead_assignments").insert({
    lead_id: lead.id,
    contractor_id: contractor.id,
    price: price.final_price,
    created_at: new Date().toISOString(),
  });

  return {
    lead: data,
    contractor,
    price: price.final_price,
  };
}