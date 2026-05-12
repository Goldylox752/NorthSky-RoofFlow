import { supabase } from "@/lib/supabase";

/* ===============================
   HELPERS
=============================== */

function nowISO() {
  return new Date().toISOString();
}

function addMinutes(ms) {
  return new Date(Date.now() + ms).toISOString();
}

/* ===============================
   MAIN
=============================== */

export async function POST(req) {
  const startedAt = Date.now();

  try {
    const { leadId, contractorId } = await req.json();

    /* ===============================
       VALIDATION
    =============================== */

    if (!leadId || !contractorId) {
      return Response.json(
        {
          success: false,
          error: "Missing leadId or contractorId",
        },
        { status: 400 }
      );
    }

    const now = nowISO();
    const lockExpiresAt = addMinutes(5 * 60 * 1000);

    /* ===============================
       1. ATOMIC CLAIM (RACE SAFE CORE)
    =============================== */

    const { data: lead, error } = await supabase
      .from("leads")
      .update({
        status: "assigned",

        assigned_contractor_id: contractorId,

        lock_owner: contractorId,
        locked_at: now,
        lock_expires_at: lockExpiresAt,
      })

      // 🔐 TRUE RACE CONDITION PROTECTION
      .eq("id", leadId)

      // Only allow claim if:
      // - not already assigned OR lock expired
      .or(
        `status.eq.new,and(status.eq.assigned,lock_expires_at.lt.${now})`
      )

      .select()
      .maybeSingle();

    /* ===============================
       ❌ CLAIM FAILED
    =============================== */

    if (error || !lead) {
      return Response.json(
        {
          success: false,
          error: "LEAD_ALREADY_CLAIMED",
        },
        { status: 409 }
      );
    }

    /* ===============================
       2. EVENT LOG (FIRE & FORGET)
    =============================== */

    supabase
      .from("events")
      .insert({
        lead_id: leadId,
        type: "lead_claimed",
        payload: {
          contractorId,
          locked_at: now,
          expires_at: lockExpiresAt,
        },
      })
      .catch(() => {});

    /* ===============================
       3. RESPONSE
    =============================== */

    return Response.json({
      success: true,
      lead,
      lockedBy: contractorId,
      expiresAt: lockExpiresAt,
      latency_ms: Date.now() - startedAt,
    });

  } catch (err) {
    console.error("🔥 Lead claim error:", err);

    return Response.json(
      {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}