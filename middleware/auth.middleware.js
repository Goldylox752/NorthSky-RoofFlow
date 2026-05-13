const { createClient } = require("@supabase/supabase-js");

/* ===============================
   AUTH CLIENT (SAFE FOR JWT VERIFICATION)
=============================== */
const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/* ===============================
   ADMIN CLIENT (DB ACCESS)
=============================== */
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ===============================
   AUTH MIDDLEWARE (PRODUCTION SAAS)
=============================== */
module.exports = async function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Missing token",
      });
    }

    /* ===============================
       VERIFY JWT (SUPABASE AUTH)
    =============================== */
    const { data, error } = await supabaseAuth.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        success: false,
        error: "Invalid session",
      });
    }

    const user = data.user;

    /* ===============================
       FETCH SAAS PROFILE (ADMIN CLIENT)
    =============================== */
    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("plan, status, stripe_customer_id")
      .eq("auth_id", user.id)
      .maybeSingle();

    /* ===============================
       HARD FAIL SAFETY
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
       ATTACH CONTEXT
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

    next();
  } catch (err) {
    console.error("Auth error:", err);

    return res.status(500).json({
      success: false,
      error: "auth_failed",
    });
  }
};