const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendSMS(contractor, lead) {
  return client.messages.create({
    to: contractor.phone,
    from: process.env.TWILIO_PHONE_NUMBER,
    body: `New lead: ${lead.type} in ${lead.city}`,
  });
}

module.exports = { sendSMS };