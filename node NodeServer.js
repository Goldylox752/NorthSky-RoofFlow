const express = require("express");

const app = express();

// Middleware (lets you read JSON requests)
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// Example API route
app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    message: "API is working",
  });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});