const supabase = require("../lib/supabase");

/* ===============================
   AUTH MIDDLEWARE (HARDENED MVP)
=============================== */
module.exports = async function auth(req, res, next) {
  try {
    const email =
      req.headers["x-user-email"];

    if (!email || typeof email !== "string") {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const { data, error } = await supabase
      .from("users")
      .select("id, email, stripe_customer_id, status")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (error || !data) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    req.user = data;

    next();

  } catch (err) {
    console.error("Auth error:", err);

    return res.status(500).json({
      success: false,
      error: "Auth middleware failed",
    });
  }
};