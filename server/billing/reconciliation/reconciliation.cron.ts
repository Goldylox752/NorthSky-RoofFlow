import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

/* ===============================
   CLIENTS (SINGLETON STYLE)
=============================== */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* ===============================
   LOGGER
=============================== */
function log(message: string, data?: any) {
  console.log(`[reconciliation] ${message}`, data ?? "");
}

/* ===============================
   MAIN CRON HANDLER
=============================== */
export async function GET(req: Request) {
  const isCron = req.headers.get("x-vercel-cron");

  if (!isCron) {
    return new Response("Unauthorized", { status: 401 });
  }

  const start = Date.now();

  try {
    log("reconciliation started");

    await Promise.all([
      syncSubscriptions(),
      syncCheckouts(),
      reconcileFailedEvents(),
    ]);

    const duration = Date.now() - start;

    log("reconciliation complete", `${duration}ms`);

    return Response.json({
      ok: true,
      duration_ms: duration,
    });
  } catch (err: any) {
    console.error("❌ reconciliation crash:", err);

    return Response.json(
      {
        ok: false,
        error: "reconciliation_failed",
      },
      { status: 500 }
    );
  }
}

/* ===============================
   SUBSCRIPTIONS SYNC
=============================== */
async function syncSubscriptions() {
  let hasMore = true;
  let startingAfter: string | null = null;

  while (hasMore) {
    const res = await stripe.subscriptions.list({
      limit: 100,
      status: "all",
      starting_after: startingAfter ?? undefined,
    });

    for (const sub of res.data) {
      try {
        const customerId = sub.customer as string;

        const { data: contractor } = await supabase
          .from("contractors")
          .select("id, active, stripe_subscription_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (!contractor) continue;

        const shouldBeActive =
          sub.status === "active" || sub.status === "trialing";

        const alreadyCorrect =
          contractor.active === shouldBeActive &&
          contractor.stripe_subscription_id === sub.id;

        if (alreadyCorrect) continue;

        const { error } = await supabase
          .from("contractors")
          .update({
            active: shouldBeActive,
            stripe_subscription_id: sub.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", contractor.id);

        if (error) {
          log("subscription update failed", error.message);
          continue;
        }

        log("subscription reconciled", {
          contractorId: contractor.id,
          active: shouldBeActive,
        });
      } catch (err: any) {
        log("subscription item error", err.message);
      }
    }

    hasMore = res.has_more;
    startingAfter = res.data.at(-1)?.id ?? null;
  }
}

/* ===============================
   CHECKOUT SYNC
=============================== */
async function syncCheckouts() {
  const sessions = await stripe.checkout.sessions.list({
    limit: 100,
  });

  for (const session of sessions.data) {
    try {
      if (session.payment_status !== "paid") continue;

      const email = session.customer_details?.email;
      if (!email) continue;

      const { data: existing } = await supabase
        .from("contractors")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existing) continue;

      const { error } = await supabase.from("contractors").insert({
        email,
        stripe_customer_id: session.customer,
        plan: "pro",
        active: true,
        created_at: new Date().toISOString(),
      });

      if (error) {
        log("checkout sync failed", error.message);
        continue;
      }

      log("checkout recovered", email);
    } catch (err: any) {
      log("checkout item error", err.message);
    }
  }
}

/* ===============================
   FAILED EVENT RECONCILIATION
=============================== */
async function reconcileFailedEvents() {
  const { data: failedEvents } = await supabase
    .from("stripe_events")
    .select("id, type")
    .eq("status", "failed")
    .limit(50);

  for (const event of failedEvents ?? []) {
    try {
      log("retry candidate", event.id);

      // future: requeue into event processor
    } catch (err: any) {
      log("event retry error", err.message);
    }
  }
}