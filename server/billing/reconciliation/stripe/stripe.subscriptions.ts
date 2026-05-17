import {
  syncSubscriptionsWorker,
  syncCheckoutsWorker,
  reconcileEventsWorker,
} from "./workers";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (req.headers.get("x-vercel-cron") !== "1") {
    return new Response("Unauthorized", { status: 401 });
  }

  const start = Date.now();

  try {
    console.log("[reconciliation] start");

    await Promise.all([
      syncSubscriptionsWorker(),
      syncCheckoutsWorker(),
      reconcileEventsWorker(),
    ]);

    return Response.json({
      ok: true,
      duration_ms: Date.now() - start,
    });
  } catch (err) {
    console.error("[reconciliation] crash", err);

    return Response.json(
      { ok: false },
      { status: 500 }
    );
  }
}