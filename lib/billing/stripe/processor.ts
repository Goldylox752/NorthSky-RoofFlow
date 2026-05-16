import { supabase } from "@/lib/supabase/client";
import { handleCheckoutCompleted } from "./handlers/checkout.completed";
import { handleSubscriptionUpdated } from "./handlers/subscription.updated";
import { handleSubscriptionDeleted } from "./handlers/subscription.deleted";
import { handleInvoicePaid } from "./handlers/invoice.paid";
import { logBillingEvent } from "./logger";

export async function processStripeEvent(event: any) {
  const eventId = event.id;
  const type = event.type;
  const payload = event.data?.object;

  try {
    /* ===============================
       IDEMPOTENCY CHECK
    =============================== */
    const { data: existing } = await supabase
      .from("billing_events")
      .select("stripe_event_id")
      .eq("stripe_event_id", eventId)
      .maybeSingle();

    if (existing) {
      console.log("Duplicate ignored:", eventId);
      return;
    }

    /* ===============================
       ROUTER
    =============================== */
    switch (type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(payload);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(payload);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(payload);
        break;

      case "invoice.paid":
        await handleInvoicePaid(payload);
        break;

      default:
        console.log("Unhandled event:", type);
    }

    await logBillingEvent(eventId, type, payload, "processed");
  } catch (err: any) {
    console.error("Event processing error:", err);

    await logBillingEvent(
      eventId,
      type,
      payload,
      "failed",
      err.message
    );

    throw err;
  }
}