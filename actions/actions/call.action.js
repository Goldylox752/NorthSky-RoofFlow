const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function triggerCall(contractor, lead) {
  return client.calls.create({
    to: contractor.phone,
    from: process.env.TWILIO_PHONE_NUMBER,
    url: "https://your-voice-webhook.com/voice",
  });
}

module.exports = { triggerCall };