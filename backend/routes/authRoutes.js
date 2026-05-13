const express = require("express");
const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");
const { signToken } = require("../lib/jwt");

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ===============================
   REGISTER
=============================== */
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert([{ email, password: hashed, role: "user", plan: "starter" }])
      .select()
      .single();

    if (error) throw error;

    const token = signToken({
      id: data.id,
      email: data.email,
      role: data.role,
      plan: data.plan,
    });

    res.json({
      success: true,
      token,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/* ===============================
   LOGIN
=============================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const valid = await bcrypt.compare(password, data.password);

    if (!valid) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const token = signToken({
      id: data.id,
      email: data.email,
      role: data.role,
      plan: data.plan,
    });

    res.json({
      success: true,
      token,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;