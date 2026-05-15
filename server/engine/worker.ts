import { runAutopilot } from "./autopilot";

let running = false;

export async function runOnce(orgId: string) {
  if (running) return;

  running = true;

  try {
    await runAutopilot(orgId);
  } catch (err) {
    console.error("Worker error:", err);
  }

  running = false;
}