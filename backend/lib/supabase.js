const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error("Missing Supabase environment variables");
}

/* ===============================
   DISABLE REALTIME COMPLETELY
   (Fixes Node 20 WebSocket crash)
=============================== */
const supabase = createClient(url, key, {
  auth: {
    persistSession: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 0,
    },
  },
});

module.exports = supabase;