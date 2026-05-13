const required = (key) => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env: ${key}`);
  return val;
};

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",

  SUPABASE_URL: required("SUPABASE_URL"),
  SUPABASE_KEY: required("SUPABASE_SERVICE_ROLE_KEY"),

  STRIPE_SECRET_KEY: required("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: required("STRIPE_WEBHOOK_SECRET"),

  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
};