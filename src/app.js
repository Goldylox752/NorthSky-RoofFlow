const express = require("express");

const authRoutes = require("./routes/auth");
const stripeRoutes = require("./routes/stripe");

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/stripe", stripeRoutes);

module.exports = app;