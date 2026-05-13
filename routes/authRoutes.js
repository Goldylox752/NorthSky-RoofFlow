const express = require("express");
const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

const {
  signAccessToken,
  signRefreshToken,
} = require("../lib/jwt");

const {
  createSession,
  deleteSession,
} = require("../lib/session.store");

const router = express.Router();

/* ===============================
   SUPABASE
=============================== */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ===============================
   HELPERS
=============================== */
const normalizeEmail = (email) =>
  email?.toLowerCase().trim() || null;

const safeError = (res, code, message) =>
  res.status(code).json({ success: false, error: message });

/* ===============================
   REGISTER
=============================== */
router.post("/register", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!email || !password) {
      return safeError(res, 400, "Missing credentials");
    }

    const { data: exists } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (exists) {
      return safeError(res, 409, "User already exists");
    }

    const hashed = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert({
        email,
        password: hashed,
        role: "user",
        plan: "starter",
      })
      .select("id, email, role, plan")
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      user: data,
    });
  } catch (err) {
    console.error("REGISTER_ERROR:", err);
    return safeError(res, 500, "Registration failed");
  }
});

/* ===============================
   LOGIN (FULL SESSION SYSTEM)
=============================== */
router.post("/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!email || !password) {
      return safeError(res, 400, "Missing credentials");
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, password, role, plan")
      .eq("email", email)
      .maybeSingle();

    if (error || !user) {
      return safeError(res, 401, "Invalid credentials");
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return safeError(res, 401, "Invalid credentials");
    }

    /* ===============================
       SESSION ID (CRITICAL)
    =============================== */
    const jti = crypto.randomUUID();

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
      jti,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await createSession(jti, {
      userId: user.id,
      email: user.email,
    });

    return res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
      },
    });
  } catch (err) {
    console.error("LOGIN_ERROR:", err);
    return safeError(res, 500, "Login failed");
  }
});

/* ===============================
   LOGOUT (REAL INVALIDATION)
=============================== */
router.post("/logout", async (req, res) => {
  try {
    const jti = req.body.jti;

    if (jti) {
      await deleteSession(jti);
    }

    return res.json({
      success: true,
      message: "Logged out",
    });
  } catch (err) {
    console.error("LOGOUT_ERROR:", err);
    return safeError(res, 500, "Logout failed");
  }
});

module.exports = router;