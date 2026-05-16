import { supabase } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      phone,
      email,
      city,
      monthly_jobs,
      lead_spend,
    } = body;

    /* ===============================
       VALIDATION
    =============================== */
    if (!name || !phone || !email) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    /* ===============================
       QUALIFICATION LOGIC
    =============================== */
    const isLowVolume = monthly_jobs === "0-5";
    const noAdSpend = lead_spend === "$0";

    const qualified = !(isLowVolume || noAdSpend);

    /* ===============================
       SAVE APPLICATION
    =============================== */
    const { error } = await supabase.from("applications").insert({
      name,
      phone,
      email,
      city,
      monthly_jobs,
      lead_spend,
      qualified,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error(error);

      return Response.json(
        { error: "Failed to save application" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      qualified,
    });
  } catch (err) {
    console.error("Server error:", err);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}