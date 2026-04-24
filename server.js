import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// homepage
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./public" });
});

// 🔥 ADD THIS ROUTE (fixes /apply/)
app.get("/apply", (req, res) => {
  res.sendFile("apply.html", { root: "./public" });
});

// optional trailing slash support
app.get("/apply/", (req, res) => {
  res.sendFile("apply.html", { root: "./public" });
});

// form handler
app.post("/api/apply", (req, res) => {
  console.log(req.body);

  res.json({ qualified: true });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
