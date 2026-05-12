import { supabase } from "@/lib/supabase";
import { calculatePrice } from "@/lib/pricingEngine";
import { routeLead } from "@/lib/routingEngine";

/* ===============================
   HELPERS (IMPROVED)
=============================== */

function buildDedupeKey(email, phone, city) {
  const identity = email || phone || "anonymous";
  const location = city?.toLowerCase().trim() || "global";
  return `${identity}:${location}`;
}

function calculateScore(email, phone, city) {
  // more realistic scoring model (0–10)
  let score = 3;

  if (email) score += 2;
  if (phone) score += 3;
  if (city) score += 1;

  // slight boost for completeness
  if (email && phone && city) score += 1;

  return Math.min(10, score);
}

async function logEvent(type, payload) {
  try {
    await supabase.from("events").insert({
      type,
      payload,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Event log failed:", err);
  }
}

/* ===============================
   MAIN ROUTE
=============================== */

export async function POST(req) {
  const start = Date.now();

  try {
    const body = await req.json();

    const {
      email,
      phone,
      name,
      city,
      source = "direct",
    } = body;

    /* ===============================
       VALIDATION
    =============================== */

    if (!email && !phone) {
      return Response.json(
        { success: false, error: "Email or phone required" },
        { status: 400 }
      );
    }

    const dedupeKey = buildDedupeKey(email, phone, city);
    const score = calculateScore(email, phone, city);

    /* ===============================
       1. IDEMPOTENCY CHECK (SAFE READ)
    =============================== */

    const { data: existing } = await supabase
      .from("leads")
      .select("id, status, assigned_contractor_id")
      .eq("dedupe_key", dedupeKey)
      .maybeSingle();

    if (existing) {
      return Response.json({
        success: true,
        duplicate: true,
        lead: existing,
      });
    }

    /* ===============================
       2. PRE-PRICE CALCULATION
    =============================== */

    const basePrice = calculatePrice(score, "basic");

    /* ===============================
       3. CREATE LEAD (ATOMIC INSERT)
    =============================== */

    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        email,
        phone,
        name,
        city: city || "unknown",
        source,

        dedupe_key: dedupeKey,

        score,
        price: basePrice,

        status: "new",

        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !lead) {
      await logEvent("lead_create_failed", { error });
      return Response.json(
        { success: false, error: "Lead creation failed" },
        { status: 500 }
      );
    }

    await logEvent("lead_created", {
      leadId: lead.id,
      score,
      city,
    });

    /* ===============================
       4. ROUTING ENGINE
    =============================== */

    let assignment = null;

    try {
      assignment = await routeLead(lead);
    } catch (err) {
      console.error("Routing error:", err);
      await logEvent("routing_error", { leadId: lead.id, err: err?.message });
    }

    /* ===============================
       5. NO ROUTE HANDLING
    =============================== */

    if (!assignment?.contractorId) {
      await logEvent("lead_unassigned", {
        leadId: lead.id,
        reason: "no_available_contractor",
      });

      return Response.json({
        success: true,
        routed: false,
        lead,
      });
    }

    /* ===============================
       6. FINAL PRICE AFTER ROUTING
    =============================== */

    const finalPrice = calculatePrice(
      score,
      assignment.cityTier || "basic"
    );

    /* ===============================
       7. ATOMIC ASSIGNMENT (RACE SAFE)
    =============================== */

    const { data: claimed } = await supabase
      .from("leads")
      .update({
        status: "assigned",

        assigned_contractor_id: assignment.contractorId,

        lock_owner: assignment.contractorId,
        locked_at: new Date().toISOString(),

        price: finalPrice,
      })
      .eq("id", lead.id)
      .eq("status", "new")
      .select()
      .maybeSingle();

    if (!claimed) {
      await logEvent("lead_claim_race", {
        leadId: lead.id,
      });

      return Response.json(
        { success: false, error: "LEAD_ALREADY_CLAIMED" },
        { status: 409 }
      );
    }

    /* ===============================
       8. FINAL EVENT LOG
    =============================== */

    await logEvent("lead_assigned", {
      leadId: lead.id,
      contractorId: assignment.contractorId,
      price: finalPrice,
      score,
    });

    /* ===============================
       RESPONSE
    =============================== */

    return Response.json({
      success: true,
      routed: true,
      lead: claimed,
      assignment,
      latency_ms: Date.now() - start,
    });

  } catch (err) {
    console.error("🔥 Lead engine crash:", err);

    await logEvent("lead_engine_crash", {
      error: err?.message,
    });

    return Response.json(
      { success: false, error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}