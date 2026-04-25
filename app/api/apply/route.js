import express from "express";
const router = express.Router();

router.post("/apply", (req, res) => {
  console.log(req.body);

  const qualified = req.body.monthly_jobs === "15+";

  res.json({ qualified });
});

export default router;
