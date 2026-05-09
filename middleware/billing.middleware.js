const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ===============================
   BILLING GUARD (PRODUCTION SAFE)
=============================== */

const PLAN_HIERARCHY = {
  starter: 1,
  growth: 2,
  elite: 3,
};

const ACTIVE_STATUSES = ["active", "trialing"];

module.exports = function billing(requiredPlan = "starter") {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user?.id) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

      /* ===============================
         FETCH TRUE SUBSCRIPTION STATE
      =============================== */
      const { data: sub, error } = await supabase
        .from("subscriptions")
        .select("plan, status, active")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (error || !sub) {
        return res.status(403).json({
          success: false,
          error: "No subscription found",
        });
      }

      /* ===============================
         STRIPE STATUS CHECK
      =============================== */
      if (!ACTIVE_STATUSES.includes(sub.status)) {
        return res.status(403).json({
          success: false,
          error: "Payment required",
        });
      }

      /* ===============================
         PLAN LEVEL CHECK
      =============================== */
      const userLevel = PLAN_HIERARCHY[sub.plan] || 0;
      const requiredLevel = PLAN_HIERARCHY[requiredPlan] || 1;

      if (userLevel < requiredLevel) {
        return res.status(403).json({
          success: false,
          error: "Upgrade required",
        });
      }

      /* ===============================
         ATTACH CLEAN BILLING CONTEXT
      =============================== */
      req.billing = {
        plan: sub.plan,
        status: sub.status,
        active: sub.active,
      };

      next();

    } catch (err) {
      console.error("Billing guard error:", err);

      return res.status(500).json({
        success: false,
        error: "Billing check failed",
      });
    }
  };
};