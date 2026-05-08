const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error("Missing Supabase environment variables");
}

/* ===============================
   PURE REST CLIENT (NO REALTIME AT ALL)
=============================== */
const supabase = createClient(url, key);

module.exports = supabase;