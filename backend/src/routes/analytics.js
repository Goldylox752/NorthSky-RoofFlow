const express = require("express");
const router = express.Router();

const analytics = require("../services/analytics.service");

/* ===============================
   DASHBOARD OVERVIEW
=============================== */
router.get("/overview", async (req, res) => {
  try {
    const [revenue, leads] = await Promise.all([
      analytics.getRevenueStats(),
      analytics.getLeadStats(),
    ]);

    res.json({
      success: true,
      revenue,
      leads,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* ===============================
   TOP LEADS
=============================== */
router.get("/top-leads", async (req, res) => {
  try {
    const data = await analytics.getTopLeads(10);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;