const supabase = require("../lib/supabase");

/* ===============================
   AUTH MIDDLEWARE
=============================== */
module.exports = async function auth(req, res, next) {
  try {
    const email =
      req.headers["x-user-email"] ||
      req.body?.email ||
      req.query?.email;

    if (!email) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (!data) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    req.user = data; // attach user to request

    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Auth middleware failed",
    });
  }
};