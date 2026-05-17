import { bootstrapQueue } from "./queue.bootstrap";
import { bootstrapMetering } from "./metering.bootstrap";
import { bootstrapCallCenter } from "./callcenter.bootstrap";
import { bootstrapEvents } from "./events.bootstrap";
import { bootstrapStripe } from "./stripe.bootstrap";
import { bootstrapTelegram } from "./telegram.bootstrap";
import { bootstrapExpress } from "./express.bootstrap";
import { bootstrapCron } from "./cron.bootstrap";

async function safe(name: string, fn: () => Promise<any>) {
  try {
    await fn();
    console.log(`[bootstrap] ${name} ready`);
  } catch (err) {
    console.error(`[bootstrap] ${name} failed`, err);
  }
}

export async function bootstrapApp(app: any) {
  console.log("[bootstrap] system starting");

  /* ===============================
     1. CORE FOUNDATION (BLOCKING)
  =============================== */
  await safe("queue", bootstrapQueue);

  /* ===============================
     2. CORE ENGINE (PARALLEL)
  =============================== */
  await Promise.all([
    safe("metering", bootstrapMetering),
    safe("call-center", bootstrapCallCenter),
  ]);

  /* ===============================
     3. EVENT LAYER
  =============================== */
  await safe("events", bootstrapEvents);

  /* ===============================
     4. EXTERNAL INTEGRATIONS (PARALLEL)
  =============================== */
  await Promise.all([
    safe("stripe", bootstrapStripe),
    safe("telegram", bootstrapTelegram),
  ]);

  /* ===============================
     5. EXPRESS API LAYER
  =============================== */
  await safe("express", async () => {
    await bootstrapExpress(app);
  });

  /* ===============================
     6. BACKGROUND SYSTEMS
  =============================== */
  await safe("cron", bootstrapCron);

  console.log("[bootstrap] system initialized");
}