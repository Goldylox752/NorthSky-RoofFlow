const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/* ================= MAIN ENGINE ================= */
async function runGoogleLeadEngine() {
  console.log("🚀 Running Lead Engine...");

  for (const location of LOCATIONS) {
    for (const keyword of KEYWORDS) {

      try {
        const results = await searchGooglePlaces(keyword, location);

        if (!results.length) continue;

        const leads = [];

        for (const place of results) {

          const lead = {
            name: place.name,
            address: place.formatted_address,
            rating: place.rating || 0,
            user_ratings_total: place.user_ratings_total || 0,
            place_id: place.place_id,
            keyword,
            location,
            created_at: new Date().toISOString(),
          };

          lead.score = scoreLead(lead);

          if (lead.score < 45) continue;

          const exists = await leadExists(lead.place_id);
          if (exists) continue;

          lead.funnel_source = "google_places_engine";
          lead.intent_level =
            lead.score >= 75 ? "hot" :
            lead.score >= 55 ? "warm" :
            "cold";

          leads.push(lead);
        }

        /* ================= BATCH INSERT ================= */
        if (leads.length) {
          const { error } = await supabase
            .from("leads")
            .insert(leads);

          if (error) {
            console.error("DB insert error:", error.message);
          }
        }

        /* ================= RATE LIMIT SAFETY ================= */
        await sleep(800);

      } catch (err) {
        console.error("Engine error:", {
          keyword,
          location,
          message: err.message,
        });
      }
    }
  }

  console.log("✅ Lead engine complete");
}