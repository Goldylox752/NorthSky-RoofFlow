app.get("/api/analytics/revenue", async (req, res) => {
  const { data: users } = await supabase
    .from("users")
    .select("plan");

  const totalLeads = users.length;
  const paidLeads = users.filter(u => u.plan === "pro").length;

  const totalRevenue = paidLeads * 1900;

  const conversionRate =
    totalLeads === 0 ? 0 : (paidLeads / totalLeads) * 100;

  res.json({
    totalRevenue,
    totalLeads,
    paidLeads,
    conversionRate: conversionRate.toFixed(2),
  });
});