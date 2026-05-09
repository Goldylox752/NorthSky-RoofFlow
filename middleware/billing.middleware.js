/* ===============================
   BILLING GUARD
=============================== */
module.exports = function billing(requiredPlan = "active") {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    // simple gating logic
    if (requiredPlan === "active" && user.status !== "active") {
      return res.status(403).json({
        success: false,
        error: "Payment required",
      });
    }

    next();
  };
};