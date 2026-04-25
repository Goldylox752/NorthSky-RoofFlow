const { normalizeGoogleLead } = require("./leadNormalizer");
const { scoreLead } = require("./leadScorer");
const { routeLead } = require("./routeLead");

async function processGoogleLeads(supabase, places, keyword, location) {

  for (const place of places) {

    const lead = normalizeGoogleLead(place, keyword, location);

    const score = scoreLead(lead);
    lead.score = score;

    // filter junk leads
    if (score < 40) continue;

    // duplicate check
    const { data: exists } = await supabase
      .from("leads")
      .select("id")
      .eq("place_id", lead.place_id)
      .maybeSingle();

    if (exists) continue;

    // save lead
    const { data: inserted } = await supabase
      .from("leads")
      .insert([lead])
      .select()
      .single();

    console.log("🔥 Lead saved:", lead.name, score);

    // route instantly
    if (inserted) {
      await routeLead(supabase, inserted);
    }
  }
}

module.exports = { processGoogleLeads };
