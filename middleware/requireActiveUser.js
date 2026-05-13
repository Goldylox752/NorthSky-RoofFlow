const supabase = require("../lib/supabase");

/* ===============================
   SAAS ACCESS GATE
=============================== */
module.exports = async function requireActiveUser(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    /* ===============================
       GET USER STATUS FROM DB
    =============================== */
    const { data: user, error } = await supabase
      .from("users")
      .select("status, plan, stripe_customer_id")
      .eq("auth_id", userId)
      .maybeSingle();

    if (error || !user) {
      return res.status(403).json({
        success: false,
        error: "User not found",
      });
    }

    /* ===============================
       BLOCK NON-ACTIVE USERS
    =============================== */
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        error: "Subscription inactive",
        status: user.status,
      });
    }

    /* ===============================
       ATTACH SAAS DATA
    =============================== */
    req.saas = {
      plan: user.plan,
      status: user.status,
      stripe_customer_id: user.stripe_customer_id,
    };

    next();
  } catch (err) {
    console.error("SaaS gate error:", err);

    return res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
};