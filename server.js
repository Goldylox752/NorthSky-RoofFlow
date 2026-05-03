// Load environment variables from .env only in development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Removed: require("./config/env");
// Removed: second require("dotenv").config();

const express = require("express");
const cors = require("cors");
const twilio = require("twilio");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

// =====================
// ENV
// =====================
const {
  OPENAI_API_KEY,
  TWILIO_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE,
  BUSINESS_PHONE,
  PORT,
} = process.env;

// ... rest of your code remains unchanged