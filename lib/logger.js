const pino = require("pino");

let transport;

try {
  // only load in dev AND only if installed
  if (process.env.NODE_ENV !== "production") {
    transport = {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    };
  }
} catch (err) {
  transport = undefined;
}

const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transport,
});

module.exports = logger;