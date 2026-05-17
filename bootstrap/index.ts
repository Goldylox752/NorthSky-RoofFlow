import { bootstrapQueue } from "./queue.bootstrap";
import { bootstrapMetering } from "./metering.bootstrap";
import { bootstrapCallCenter } from "./callcenter.bootstrap";
import { bootstrapStripe } from "./stripe.bootstrap";
import { bootstrapTelegram } from "./telegram.bootstrap";
import { bootstrapExpress } from "./express.bootstrap";
import { bootstrapCron } from "./cron.bootstrap";

export async function bootstrapApp(app: any) {
  console.log("🚀 System boot starting...");

  await bootstrapQueue();
  await bootstrapMetering();
  await bootstrapCallCenter();
  await bootstrapStripe();
  await bootstrapTelegram();
  await bootstrapExpress(app);
  await bootstrapCron();

  console.log("✅ System fully initialized");
}