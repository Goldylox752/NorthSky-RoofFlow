const twilio = require("twilio");
const db = require("../core/db");
const crypto = require("crypto");
const { log } = require("../core/logger");

const client =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

async function makeCall(to, message) {
  if (!client) return null;

  const callId = crypto.randomUUID();

  db.calls.set(callId, { id: callId, to, status: "queued" });

  try {
    const call = await client.calls.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      twiml: `<Response><Say>${message}</Say></Response>`,
    });

    db.calls.get(callId).status = "completed";
    db.calls.get(callId).sid = call.sid;

    return callId;
  } catch (err) {
    db.calls.get(callId).status = "failed";
    log("Twilio error:", err.message);
    return null;
  }
}

module.exports = { makeCall };