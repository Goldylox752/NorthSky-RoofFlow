import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🧠 Lead scoring helper
function calculateLeadScore({ email, phone, zip }) {
  let score = 0;
  if (email) score += 40;
  if (phone) score += 30;
  if (zip) score += 30;
  return score;
}

// 🔥 Lead status engine
function getLeadStatus(score) {
  if (score >= 80) return "hot";
  if (score >= 50) return "warm";
  return "new";
}

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      name = "",
      email = "",
      phone,
      city = "",
      zip = "",
      source = "website",
      plan = "",
    } = body;

    // 🔐 validation
    if (!phone) {
      return Response.json(
        { error: "Phone is required" },
        { status: 400 }
      );
    }

    // 🧠 scoring
    const lead_score = calculateLeadScore({ email, phone, zip });
    const status = getLeadStatus(lead_score);

    // 💾 save lead
    const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          name,
          email,
          phone,
          city,
          zip,
          plan,
          source,
          lead_score,
          status,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);

      return Response.json(
        { error: "Failed to save lead" },
        { status: 500 }
      );
    }

    // ✅ response
    return Response.json({
      success: true,
      lead: data,
    });
  } catch (err) {
    console.error("Server error:", err);

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
