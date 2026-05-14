const express = require("express");
const bot = require("./bot");

const router = express.Router();

router.post("/", (req, res) => {
  try {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

module.exports = router;