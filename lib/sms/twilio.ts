import twilio from "twilio";

/* ===============================
   CLIENT (singleton)
=============================== */
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

/* ===============================
   SEND SMS
=============================== */
export async function sendSMS(to: string, message: string) {
  try {
    return await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to,
    });
  } catch (err: any) {
    console.error("SMS failed:", err.message);
    return null;
  }
}