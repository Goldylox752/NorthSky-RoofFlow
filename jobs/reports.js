const { sendDailyReport, sendWeeklyReport } = require("../lib/reports");

(async () => {
  const type = process.argv[2];

  if (type === "daily") {
    await sendDailyReport();
  }

  if (type === "weekly") {
    await sendWeeklyReport();
  }

  process.exit(0);
})();