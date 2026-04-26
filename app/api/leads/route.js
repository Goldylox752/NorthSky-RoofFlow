import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

// ===============================
// GET ALL LEADS (ADMIN DASHBOARD)
// ===============================
export async function GET() {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return Response.json({
    leads: data,
  });
}