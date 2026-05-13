const supabase = require("../lib/supabase");

/* ===============================
   SAFE RESPONSE HELPERS
=============================== */
const success = (res, data) => {
  return res.status(200).json({
    success: true,
    data,
  });
};

const fail = (res, message, code = 500) => {
  return res.status(code).json({
    success: false,
    error: message,
  });
};

/* ===============================
   CREATE LEAD
=============================== */
exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, city } = req.body;

    /* ===============================
       VALIDATION (CRITICAL)
    =============================== */
    if (!email || !phone) {
      return fail(res, "Email and phone are required", 400);
    }

    /* ===============================
       NORMALIZE DATA
    =============================== */
    const lead = {
      name: name?.trim() || "Unknown",
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      city: city?.trim() || null,
      created_at: new Date().toISOString(),
    };

    /* ===============================
       DUPLICATE CHECK (IMPORTANT FOR SAAS)
    =============================== */
    const { data: existing } = await supabase
      .from("leads")
      .select("id")
      .eq("email", lead.email)
      .maybeSingle();

    if (existing) {
      return fail(res, "Lead already exists", 409);
    }

    /* ===============================
       INSERT LEAD
    =============================== */
    const { data, error } = await supabase
      .from("leads")
      .insert([lead])
      .select()
      .single();

    if (error) {
      return fail(res, error.message);
    }

    return success(res, data);
  } catch (err) {
    console.error("Create lead error:", err);
    return fail(res, "Internal server error");
  }
};