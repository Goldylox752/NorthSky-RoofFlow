const { bot, path } = require("../bot");

module.exports = (app) => {
  app.post(path, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
};