import twilio from "twilio";

/* ===============================
   ENV HELPERS
=============================== */
const requiredEnv = (key: string) => {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

const maskSid = (sid: string) =>
  sid ? `${sid.slice(0, 6)}****` : "unknown";

/* ===============================
   CONFIG
=============================== */
const TWILIO_SID = requiredEnv("TWILIO_SID");
const TWILIO_AUTH_TOKEN = requiredEnv("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER =
  process.env.TWILIO_PHONE_NUMBER?.trim() || null;

/* ===============================
   SERVICE CLASS
=============================== */
class TwilioService {
  private static instance: any;
  private static initialized = false;

  static getClient() {
    if (!this.instance) {
      this.instance = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN, {
        lazyLoading: true,
        autoRetry: true,
        maxRetries: 3,
      });

      if (!this.initialized) {
        console.log(`📞 Twilio ready (${maskSid(TWILIO_SID)})`);
        this.initialized = true;
      }
    }

    return this.instance;
  }

  static async verifyConnection() {
    try {
      const client = this.getClient();
      await client.api.accounts(TWILIO_SID).fetch();
      console.log("✅ Twilio connection verified");
      return true;
    } catch (err: any) {
      console.error("❌ Twilio verification failed:", err.message);
      return false;
    }
  }

  static async sendSMS({
    to,
    body,
  }: {
    to: string;
    body: string;
  }) {
    const client = this.getClient();

    if (!TWILIO_PHONE_NUMBER) {
      throw new Error("Missing TWILIO_PHONE_NUMBER");
    }

    return client.messages.create({
      to,
      body,
      from: TWILIO_PHONE_NUMBER,
    });
  }
}

export const client = TwilioService.getClient();
export default TwilioService;