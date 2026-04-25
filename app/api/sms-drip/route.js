import { createClient } from "@supabase/supabase-js";
import { sendSMS } from "@/lib/sendSMS";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  const now = new Date();

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("status", "active");

  for (const lead of leads) {
    const created = new Date(lead.created_at);
    const days = Math.floor((now - created) / (1000 * 60 * 60 * 24));

    // DAY 1
    if (days === 1 && lead.stage !== "day1") {
      await sendSMS(
        lead.phone,
        "RoofFlow reminder: spots are filling fast this week. Book your onboarding."
      );

      await supabase
        .from("leads")
        .update({ stage: "day1" })
        .eq("id", lead.id);
    }

    // DAY 3 (URGENCY)
    if (days === 3 && lead.stage !== "day3") {
      await sendSMS(
        lead.phone,
        "Final reminder: we may close your territory soon. Book now: https://calendly.com/yourlink"
      );

      await supabase
        .from("leads")
        .update({ stage: "day3" })
        .eq("id", lead.id);
    }
  }

  return Response.json({ ok: true });
}
