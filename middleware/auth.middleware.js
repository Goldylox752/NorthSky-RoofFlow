const { createClient } = require("@supabase/supabase-js");

/* ===============================
   SERVER SUPABASE CLIENT (IMPORTANT)
=============================== */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // 🔥 IMPORTANT UPGRADE
);

/* ===============================
   AUTH MIDDLEWARE (SAAS READY)
=============================== */
module.exports = async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Missing token",
      });
    }

    /* ===============================
       VERIFY USER TOKEN
    =============================== */
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        success: false,
        error: "Invalid session",
      });
    }

    const user = data.user;

    /* ===============================
       GET SAAS PROFILE
    =============================== */
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("stripe_customer_id, status, plan")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile error:", profileError);
    }

    /* ===============================
       HARD BLOCK (SAAS RULE)
    =============================== */
    if (!profile) {
      return res.status(403).json({
        success: false,
        error: "User profile missing",
      });
    }

    if (profile.status !== "active") {
      return res.status(403).json({
        success: false,
        error: "Subscription inactive",
        status: profile.status,
      });
    }

    /* ===============================
       ATTACH USER CONTEXT
    =============================== */
    req.user = {
      id: user.id,
      email: user.email,
    };

    req.saas = {
      plan: profile.plan,
      status: profile.status,
      stripe_customer_id: profile.stripe_customer_id,
    };

    return next();
  } catch (err) {
    console.error("Auth error:", err);

    return res.status(500).json({
      success: false,
      error: "auth_failed",
    });
  }
};