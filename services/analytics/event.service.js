const supabase = require("../../lib/supabase");

/**
 * EVENT TRACKING (SAAS GROWTH LAYER)
 */
exports.logEvent = async ({ type, leadId, userId, meta }) => {
  await supabase.from("lead_events").insert([
    {
      type,
      lead_id: leadId,
      user_id: userId,
      meta,
      created_at: new Date().toISOString(),
    },
  ]);
};