import { stripe } from "@/lib/stripe";

export async function POST(req) {
  const { priceId, user } = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],

    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],

    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,

    // 🔐 THIS IS THE IMPORTANT PART
    metadata: {
      userId: user.id,
    },
  });

  return Response.json({ url: session.url });
}