require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const Stripe = require("stripe");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ===============================
   ADMIN CHECK
=============================== */
const ADMIN_IDS = (process.env.ADMIN_IDS || "").split(",");

function isAdmin(id) {
  return ADMIN_IDS.includes(String(id));
}

/* ===============================
   CREATE PRODUCT + PRICE
   /addproduct Roofing Lead 49
=============================== */
bot.onText(/\/addproduct (.+) (\d+)/, async (msg, match) => {
  if (!isAdmin(msg.from.id)) return;

  const name = match[1];
  const price = Number(match[2]);

  try {
    const product = await stripe.products.create({
      name,
    });

    const stripePrice = await stripe.prices.create({
      product: product.id,
      unit_amount: price * 100,
      currency: "usd",
    });

    bot.sendMessage(
      msg.chat.id,
      `Product created:
Name: ${name}
Price: $${price}
Product ID: ${product.id}
Price ID: ${stripePrice.id}`
    );
  } catch (err) {
    bot.sendMessage(msg.chat.id, "Error creating product");
    console.error(err);
  }
});

/* ===============================
   LIST PRODUCTS
=============================== */
bot.onText(/\/products/, async (msg) => {
  if (!isAdmin(msg.from.id)) return;

  const products = await stripe.products.list({ limit: 10 });

  const text = products.data
    .map((p) => `• ${p.name} | ${p.id}`)
    .join("\n");

  bot.sendMessage(msg.chat.id, text || "No products");
});

/* ===============================
   GENERATE CHECKOUT LINK
   /checkout price_123
=============================== */
bot.onText(/\/checkout (.+)/, async (msg, match) => {
  if (!isAdmin(msg.from.id)) return;

  const priceId = match[1];

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: "https://example.com/success",
      cancel_url: "https://example.com/cancel",
    });

    bot.sendMessage(msg.chat.id, session.url);
  } catch (err) {
    bot.sendMessage(msg.chat.id, "Checkout error");
  }
});