const supabase = require("../lib/supabase");

/* ===============================
   HELPERS
=============================== */
function isAdmin(msg) {
  const admins = (process.env.ADMIN_IDS || "").split(",");
  return admins.includes(String(msg.from.id));
}

function send(bot, msg, text) {
  return bot.sendMessage(msg.chat.id, text);
}

/* ===============================
   SUPABASE COMMANDS MODULE
=============================== */
module.exports = function (bot) {

  /* ===============================
     /db_ping
  =============================== */
  bot.onText(/\/db_ping/, async (msg) => {
    try {
      const { error } = await supabase
        .from("leads")
        .select("id")
        .limit(1);

      if (error) throw error;

      send(bot, msg, "🟢 Supabase connected");
    } catch (err) {
      send(bot, msg, "🔴 Supabase error: " + err.message);
    }
  });

  /* ===============================
     /db_stats
  =============================== */
  bot.onText(/\/db_stats/, async (msg) => {
    try {
      if (!isAdmin(msg)) return;

      const { count: leads } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true });

      const { count: users } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      const { count: events } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true });

      send(
        bot,
        msg,
        `📊 DB STATS\n\nLeads: ${leads}\nUsers: ${users}\nEvents: ${events}`
      );
    } catch (err) {
      send(bot, msg, "Error fetching stats");
    }
  });

  /* ===============================
     /leads_recent
  =============================== */
  bot.onText(/\/leads_recent/, async (msg) => {
    try {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (!data?.length) {
        return send(bot, msg, "No leads found");
      }

      const text = data
        .map(
          (l) =>
            `🧾 ${l.name || "No name"}\n📍 ${l.city || "N/A"}\n💰 $${l.price || 0}\n⚡ ${l.status}`
        )
        .join("\n\n");

      send(bot, msg, text);
    } catch (err) {
      send(bot, msg, "Failed to fetch leads");
    }
  });

  /* ===============================
     /lead <id>
  =============================== */
  bot.onText(/\/lead (.+)/, async (msg, match) => {
    try {
      const id = match?.[1];

      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!data) {
        return send(bot, msg, "Lead not found");
      }

      send(
        bot,
        msg,
        `🧾 Lead Details\n\nID: ${data.id}\nCity: ${data.city}\nScore: ${data.score}\nPrice: $${data.price}\nStatus: ${data.status}`
      );
    } catch (err) {
      send(bot, msg, "Error fetching lead");
    }
  });

  /* ===============================
     /events_recent
  =============================== */
  bot.onText(/\/events_recent/, async (msg) => {
    try {
      if (!isAdmin(msg)) return;

      const { data } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      const text =
        data?.map((e) => `📌 ${e.type} | ${e.created_at}`).join("\n") ||
        "No events";

      send(bot, msg, text);
    } catch (err) {
      send(bot, msg, "Error fetching events");
    }
  });
};