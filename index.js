import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("NorthSky backend running");
});

app.post("/api/events", (req, res) => {
  console.log("Event received:", req.body);
  res.json({ ok: true });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server live");
});
