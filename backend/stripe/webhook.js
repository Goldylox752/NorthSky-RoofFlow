import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return Response.json(
        { success: false, error: "missing_signature" },
        { status: 400 }
      );
    }

    const body = await req.text();

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("[stripe webhook] invalid signature:", err.message);

      return Response.json(
        { success: false, error: "invalid_signature" },
        { status: 400 }
      );
    }

    const data = event.data.object;

    try {
      const { dispatchLead } = await import("@/call-center/dispatch");

      switch (event.type) {
        case "checkout.session.completed":
        case "payment_intent.succeeded":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
        case "invoice.paid":
          await dispatchLead({
            source: "stripe",
            type: event.type,
            data,
          });
          break;

        default:
          console.log("[stripe webhook] unhandled event:", event.type);
      }

      return Response.json({
        success: true,
        received: true,
      });
    } catch (err) {
      console.error("[stripe webhook] processing error:", err);

      return Response.json(
        { success: false, error: "webhook_processing_failed" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("[stripe webhook] fatal error:", err);

    return Response.json(
      { success: false, error: "server_error" },
      { status: 500 }
    );
  }
}