const supabase = require("../lib/supabase");

/* ===============================
   HELPERS
=============================== */

function nowISO() {
  return new Date().toISOString();
}

function addMinutes(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

/* ===============================
   LEAD CLAIM (ATOMIC SAAS SAFE)
=============================== */

exports.claimLead = async (req, res) => {
  const startedAt = Date.now();

  try {
    const { leadId, contractorId } = req.body;

    /* ===============================
       VALIDATION
    =============================== */
    if (!leadId || !contractorId) {
      return res.status(400).json({
        success: false,
        error: "Missing leadId or contractorId",
      });
    }

    const now = nowISO();
    const lockExpiresAt = addMinutes(5);

    /* ===============================
       1. ATOMIC CLAIM (RACE SAFE)
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
      .eq("id", leadId)
      .or(`status.eq.new,and(status.eq.assigned,lock_expires_at.lt.${now})`)
      .select()
      .maybeSingle();

    /* ===============================
       FAILED CLAIM
    =============================== */
    if (error || !lead) {
      return res.status(409).json({
        success: false,
        error: "LEAD_ALREADY_CLAIMED",
      });
    }

    /* ===============================
       2. EVENT LOG (NON-BLOCKING)
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
    return res.json({
      success: true,
      lead,
      lockedBy: contractorId,
      expiresAt: lockExpiresAt,
      latency_ms: Date.now() - startedAt,
    });
  } catch (err) {
    console.error("Lead claim error:", err);

    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};