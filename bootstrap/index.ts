import { bootstrapQueue } from "./queue.bootstrap";
import { bootstrapMetering } from "./metering.bootstrap";
import { bootstrapCallCenter } from "./callcenter.bootstrap";
import { bootstrapEvents } from "./events.bootstrap";
import { bootstrapStripe } from "./stripe.bootstrap";
import { bootstrapTelegram } from "./telegram.bootstrap";
import { bootstrapExpress } from "./express.bootstrap";
import { bootstrapCron } from "./cron.bootstrap";

function safe(name: string, fn: () => Promise<any>) {
  return fn().catch((err) => {
    console.error(`[bootstrap] ${name} failed`, err);
  });
}

export async function bootstrapApp(app: any) {
  console.log("[bootstrap] system starting");

  // 1. Foundation layer
  await safe("queue", bootstrapQueue);

  // 2. Core engine layer (parallel-safe)
  await Promise.all([
    safe("metering", bootstrapMetering),
    safe("call-center", bootstrapCallCenter),
  ]);

  // 3. Event system (bridge layer)
  await safe("events", bootstrapEvents);

  // 4. External integrations (parallel-safe)
  await Promise.all([
    safe("stripe", bootstrapStripe),
    safe("telegram", bootstrapTelegram),
  ]);

  // 5. API layer
  await safe("express", () => Promise.resolve(bootstrapExpress(app)));

  // 6. Background systems
  await safe("cron", bootstrapCron);

  console.log("[bootstrap] system initialized");
}