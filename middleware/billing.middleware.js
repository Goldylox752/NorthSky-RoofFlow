/* ===============================
   BILLING GUARD (PRODUCTION)
=============================== */

const PLAN_HIERARCHY = {
  starter: 1,
  growth: 2,
  elite: 3,
};

const ACTIVE_STATUSES = ["active", "trialing"];

module.exports = function billing(requiredPlan = "starter") {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const userStatus = user.status || "inactive";
    const userPlan = user.plan || "starter";

    /* ===============================
       STRIPE STATUS CHECK
    =============================== */
    const isActive = ACTIVE_STATUSES.includes(userStatus);

    if (!isActive) {
      return res.status(403).json({
        success: false,
        error: "Payment required",
      });
    }

    /* ===============================
       PLAN LEVEL CHECK
    =============================== */
    const userLevel = PLAN_HIERARCHY[userPlan] || 0;
    const requiredLevel = PLAN_HIERARCHY[requiredPlan] || 1;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        error: "Upgrade required",
      });
    }

    next();
  };
};