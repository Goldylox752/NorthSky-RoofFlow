export async function bootstrapApp(app?: any) {
  console.log("[bootstrap] starting system...");

  // 1. Core infrastructure (must succeed)
  await withRetry("queue", bootstrapQueue, 5, true);

  // 2. Core services (parallel but tracked separately)
  await withRetry("metering", bootstrapMetering, 3, true);
  await withRetry("call-center", bootstrapCallCenter, 3, true);

  assertReady(["queue", "metering", "call-center"]);

  // 3. Events layer (optional)
  await withRetry("events", bootstrapEvents, 3, false);

  // 4. External services (stripe critical, telegram optional)
  await withRetry("stripe", bootstrapStripe, 3, true);
  await withRetry("telegram", bootstrapTelegram, 3, false);

  assertReady(["stripe"]);

  // 5. API layer (Express only if you're actually running a server)
  if (app) {
    await withRetry("express", () => bootstrapExpress(app), 2, true);
  }

  // 6. Background jobs
  await withRetry("cron", bootstrapCron, 2, false);

  // Final check
  assertReady(["queue", "metering", "call-center", "stripe"]);

  console.log("[bootstrap] SYSTEM READY");
  console.log(systemState);
}