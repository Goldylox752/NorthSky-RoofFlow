import { createClient } from "@supabase/supabase-js";
import { assignLead } from "../../engine/assignLead";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, phone, city, org_id, source = "web" } = req.body;

  if (!name || !phone || !org_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {

    // =========================
    // 1. DUPLICATE CHECK
    // =========================
    const { data: existing } = await supabase
      .from("leads")
      .select("id")
      .eq("phone", phone)
      .eq("org_id", org_id)
      .maybeSingle();

    if (existing) {
      return res.json({
        success: true,
        message: "Lead already exists",
        lead_id: existing.id
      });
    }

    // =========================
    // 2. CREATE LEAD (SOURCE OF TRUTH)
    // =========================
    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        name,
        phone,
        city,
        org_id,
        source,
        status: "processing",
        score: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Lead creation failed" });
    }

    // =========================
    // 3. ASSIGNMENT (CONTROLLED ENGINE)
    // =========================
    let assignment = null;

    try {
      assignment = await assignLead({
        lead_id: lead.id,
        org_id,
        supabase
      });

    } catch (err) {
      console.error("Assignment failed:", err);

      await supabase
        .from("leads")
        .update({ status: "unassigned" })
        .eq("id", lead.id);

      return res.json({
        success: true,
        lead,
        assigned: false
      });
    }

    // =========================
    // 4. ATOMIC STATE UPDATE
    // =========================
    if (assignment?.agent_id) {

      await Promise.all([
        supabase.from("assignments").insert({
          lead_id: lead.id,
          agent_id: assignment.agent_id,
          org_id,
          status: "active",
          created_at: new Date().toISOString()
        }),

        supabase.from("leads").update({
          status: "assigned",
          assigned_to: assignment.agent_id
        }).eq("id", lead.id)
      ]);
    }

    // =========================
    // 5. EVENT LOG (OS AUDIT LAYER)
    // =========================
    await supabase.from("events").insert({
      type: "lead_assigned",
      org_id,
      payload: {
        lead_id: lead.id,
        agent_id: assignment?.agent_id
      }
    });

    return res.json({
      success: true,
      lead,
      assigned_to: assignment?.agent_name || null
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
}