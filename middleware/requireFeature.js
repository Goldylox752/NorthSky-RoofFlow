// subscription.middleware.js
const supabase = require("../lib/supabase");

module.exports = async function requireSubscription(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("plan, status, stripe_customer_id")
      .eq("auth_id", userId)
      .maybeSingle();

    if (error || !user) {
      return res.status(403).json({ error: "user_not_found" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ error: "subscription_inactive" });
    }

    req.subscription = {
      plan: user.plan,
      status: user.status,
      stripe_customer_id: user.stripe_customer_id,
    };

    next();
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
};