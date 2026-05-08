const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error("Missing Supabase environment variables");
}

/* ===============================
   REST-ONLY SAFE CLIENT (NODE 20 SAFE)
=============================== */
const supabase = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 0,
    },
  },
  db: {
    schema: "public",
  },
});

module.exports = supabase;