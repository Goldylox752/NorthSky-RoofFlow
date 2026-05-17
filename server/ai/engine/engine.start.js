const { runEngineLoop } = require("./engine.loop");

const INTERVAL_MS = 15000;

function startAIEngine() {
  console.log("🚀 AI Engine Online");

  runEngineLoop();

  setInterval(async () => {
    await runEngineLoop();
  }, INTERVAL_MS);
}

module.exports = { startAIEngine };