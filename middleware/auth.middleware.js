const { createClient } = require("@supabase/supabase-js");

/* ===============================
   SUPABASE CLIENTS
=============================== */
const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ===============================
   FEATURE FLAGS (plug-in ready)
=============================== */
const FEATURES = {
  starter: {
    ai_scoring: true,
    lead_export: false,
    priority_routing: false,
    api_access: false,
  },
  growth: {
    ai_scoring: true,
    lead_export: true,
    priority_routing: true,
    api_access: false,
  },
  elite: {
    ai_scoring: true,
    lead_export: true,
    priority_routing: true,
    api_access: true,
  },
};

/* ===============================
   HELPERS
=============================== */
function getFeatures(plan) {
  return FEATURES?.[plan] || {};
}

function hasFeature(plan, feature) {
  return Boolean(FEATURES?.[plan]?.[feature]);
}

/* ===============================
   AUTH MIDDLEWARE
=============================== */
module.exports = async function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "missing_token",
      });
    }

    /* ===============================
       VERIFY USER (SUPABASE JWT)
    =============================== */
    const { data, error } = await supabaseAuth.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        success: false,
        error: "invalid_session",
      });
    }

    const authUser = data.user;

    /* ===============================
       FETCH SAAS PROFILE
    =============================== */
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("plan, status, stripe_customer_id")
      .eq("auth_id", authUser.id)
      .maybeSingle();

    if (profileError) {
      return res.status(500).json({
        success: false,
        error: "profile_fetch_failed",
      });
    }

    if (!profile) {
      return res.status(403).json({
        success: false,
        error: "user_profile_missing",
      });
    }

    if (profile.status !== "active") {
      return res.status(403).json({
        success: false,
        error: "subscription_inactive",
        status: profile.status,
      });
    }

    /* ===============================
       CONTEXT ATTACHMENT
    =============================== */
    req.user = {
      id: authUser.id,
      email: authUser.email,
    };

    req.saas = {
      plan: profile.plan,
      status: profile.status,
      stripe_customer_id: profile.stripe_customer_id,
    };

    /* ===============================
       FEATURE LAYER (NEW)
    =============================== */
    req.features = getFeatures(profile.plan);
    req.hasFeature = (feature) => hasFeature(profile.plan, feature);

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);

    return res.status(500).json({
      success: false,
      error: "auth_failed",
    });
  }
};