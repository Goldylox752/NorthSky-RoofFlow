import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* ===============================
   CHARGE CONTRACTOR (SOURCE OF TRUTH)
=============================== */

export async function chargeContractor({
  contractorId,
  lead,
  amount,
  description = "RoofFlow lead charge",
}: {
  contractorId: string;
  lead: any;
  amount: number;
  description?: string;
}) {
  try {
    /* ===============================
       1. GET CONTRACTOR
    =============================== */
    const { data: contractor, error } = await supabase
      .from("contractors")
      .select("stripe_customer_id")
      .eq("id", contractorId)
      .single();

    if (error || !contractor?.stripe_customer_id) {
      throw new Error("Missing Stripe customer");
    }

    /* ===============================
       2. CREATE PAYMENT INTENT
    =============================== */
    const payment = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      customer: contractor.stripe_customer_id,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      metadata: {
        leadId: lead.id,
        contractorId,
        description,
      },
    });

    /* ===============================
       3. UPDATE LEAD (SUCCESS)
    =============================== */
    await supabase
      .from("leads")
      .update({
        billed: true,
        payment_status: "paid",
        stripe_payment_intent: payment.id,
      })
      .eq("id", lead.id);

    /* ===============================
       4. REVENUE LOG
    =============================== */
    await supabase.from("revenue_logs").insert({
      contractor_id: contractorId,
      lead_id: lead.id,
      amount,
      stripe_payment_intent: payment.id,
      created_at: new Date().toISOString(),
    });

    return {
      success: true,
      paymentId: payment.id,
    };
  } catch (err: any) {
    console.error("Stripe charge failed:", err.message);

    /* ===============================
       FAIL STATE UPDATE
    =============================== */
    await supabase
      .from("leads")
      .update({
        payment_status: "failed",
      })
      .eq("id", lead.id);

    return {
      success: false,
      error: err.message,
    };
  }
}