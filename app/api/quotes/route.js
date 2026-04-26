import { supabase } from "@/lib/supabase";

export async function POST(req) {
  const body = await req.json();

  const { job_id, amount, breakdown = {} } = body;

  const { data, error } = await supabase
    .from("quotes")
    .insert([
      {
        job_id,
        amount,
        breakdown,
        status: "draft",
      },
    ])
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ quote: data });
}