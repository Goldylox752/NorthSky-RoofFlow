const { createClient } = require("@supabase/supabase-js");

/* ===============================
   SUPABASE CLIENT
=============================== */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/* ===============================
   AUTH MIDDLEWARE (JWT)
=============================== */
module.exports = async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Missing Authorization header",
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Missing token",
      });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token",
      });
    }

    const user = data.user;

    /* ===============================
       OPTIONAL DB PROFILE LOOKUP
    =============================== */
    const { data: profile } = await supabase
      .from("users")
      .select("stripe_customer_id, status")
      .eq("auth_id", user.id)
      .maybeSingle();

    /* ===============================
       ATTACH USER TO REQUEST
    =============================== */
    req.user = {
      id: user.id,
      email: user.email || null, // ✅ FIX: needed for Stripe checkout
      stripe_customer_id: profile?.stripe_customer_id || null,
      status: profile?.status || "unknown",
    };

    return next();

  } catch (err) {
    console.error("Auth error:", err);

    return res.status(401).json({
      success: false,
      error: "Authentication failed",
    });
  }
};