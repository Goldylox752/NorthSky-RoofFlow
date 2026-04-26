import { PLANS } from "@/lib/stripe/stripe-plans";
import { stripe } from "@/lib/stripe";

export async function POST(req) {
  try {
    const { plan, user } = await req.json();

    if (!plan || !user?.id) {
      return Response.json(
        { error: "Missing plan or user" },
        { status: 400 }
      );
    }

    const selected = PLANS[plan];

    if (!selected?.priceId) {
      return Response.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      line_items: [
        {
          price: selected.priceId,
          quantity: 1,
        },
      ],

      metadata: {
        userId: user.id,
        plan,
      },

      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    });

    return Response.json({ url: session.url });

  } catch (err) {
    return Response.json(
      { error: err.message || "Checkout failed" },
      { status: 500 }
    );
  }
}