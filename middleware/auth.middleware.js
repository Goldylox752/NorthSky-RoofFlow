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
   - Auth only
   - NO email leakage
   - auth_id is single source of truth
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

    /* ===============================
       VERIFY USER VIA SUPABASE JWT
    =============================== */
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token",
      });
    }

    /* ===============================
       ATTACH MINIMAL USER CONTEXT
       (IMPORTANT: no email to enforce clean architecture)
    =============================== */
    req.user = {
      id: data.user.id,
    };

    next();

  } catch (err) {
    console.error("Auth error:", err);

    return res.status(401).json({
      success: false,
      error: "Authentication failed",
    });
  }
};