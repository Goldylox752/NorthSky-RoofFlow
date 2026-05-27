app.post("/ai/mining/run", async (req, res) => {
  const topPerformers = await supabase
    .from("products")
    .select("*")
    .order("score", { ascending: false })
    .limit(20);

  const winners = await aiModel.pickWinningCategories(topPerformers);

  const scraped = await scrapeAliExpress(winners.query);

  const mapped = scraped.map(mapProduct);

  for (const p of mapped) {
    if (!p) continue;
    await supabase.from("products").insert(p);
  }

  res.json({ imported: mapped.length });
});