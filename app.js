const express = require("express");
const bot = require("./config/telegram");

const { send } = require("./services/telegram.service");
const { getOrCreateUser, isPro } = require("./services/user.service");
const { createCheckoutSession } = require("./services/stripe.service");

const { PORT } = require("./config/env");

const app = express();

/* ===============================
   MIDDLEWARE
=============================== */
app.use("/stripe-webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "1mb" }));

/* ===============================
   TELEGRAM SETUP
=============================== */
if (bot) {
  bot.setMyCommands([
    { command: "start", description: "Start bot" },
    { command: "profile", description: "View profile" },
    { command: "plan", description: "View plan status" },
    { command: "upgrade", description: "Upgrade to PRO" },
  ]);

  /* ===============================
     /START
  =============================== */
  bot.onText(/\/start/, async (msg) => {
    try {
      const user = await getOrCreateUser(msg.from);

      await send(
        msg.chat.id,
        `Welcome ${user.username}\nPlan: ${user.plan}`
      );

      if (!isPro(user)) {
        await send(
          msg.chat.id,
          "Upgrade to PRO to unlock full access."
        );
      }
    } catch (err) {
      console.error("[TELEGRAM_START_ERROR]", err);
    }
  });

  /* ===============================
     /PROFILE
  =============================== */
  bot.onText(/\/profile/, async (msg) => {
    try {
      const user = await getOrCreateUser(msg.from);

      await send(
        msg.chat.id,
        `Profile\nUser: ${user.username}\nPlan: ${user.plan}`
      );
    } catch (err) {
      console.error("[TELEGRAM_PROFILE_ERROR]", err);
    }
  });

  /* ===============================
     /PLAN
  =============================== */
  bot.onText(/\/plan/, async (msg) => {
    try {
      const user = await getOrCreateUser(msg.from);

      await send(
        msg.chat.id,
        `Current Plan: ${user.plan}`
      );
    } catch (err) {
      console.error("[TELEGRAM_PLAN_ERROR]", err);
    }
  });

  /* ===============================
     /UPGRADE (STRIPE CHECKOUT)
  =============================== */
  bot.onText(/\/upgrade/, async (msg) => {
    try {
      const user = await getOrCreateUser(msg.from);

      const session = await createCheckoutSession(user.telegram_id);

      if (!session?.url) {
        throw new Error("Missing checkout URL");
      }

      await send(msg.chat.id, `Upgrade here:\n${session.url}`);
    } catch (err) {
      console.error("[TELEGRAM_UPGRADE_ERROR]", err);

      await send(
        msg.chat.id,
        "Unable to create checkout session. Try again later."
      );
    }
  });
}

/* ===============================
   HEALTH CHECK
=============================== */
app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "telegram-stripe-saas",
    bot: !!bot,
  });
});

module.exports = app;