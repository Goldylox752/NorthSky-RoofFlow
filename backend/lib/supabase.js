const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error("Missing Supabase environment variables");
}

/* ===============================
   SERVER-ONLY SUPABASE CLIENT
   (REST ONLY - NO REALTIME)
=============================== */
const supabase = createClient(url, key);

module.exports = supabase;