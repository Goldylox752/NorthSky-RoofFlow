import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ===============================
// CREATE STRIPE CHECKOUT SESSION
// ===============================
export async function POST(req) {
  try {
    const body = await req.json();
    const { priceId } = body;

    if (!priceId) {
      return Response.json(
        { error: "Missing priceId" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
    });

    return Response.json({ url: session.url });

  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}