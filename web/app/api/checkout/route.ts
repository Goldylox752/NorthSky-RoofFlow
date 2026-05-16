import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

const PRICE_IDS: Record<string, string> = {
  starter: "price_starter",
  growth: "price_growth",
  elite: "price_elite",
};

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();

    if (!plan || !PRICE_IDS[plan]) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid plan",
        },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      payment_method_types: ["card"],

      line_items: [
        {
          price: PRICE_IDS[plan],
          quantity: 1,
        },
      ],

      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,

      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}`,

      metadata: {
        plan,
      },
    });

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Checkout failed",
      },
      { status: 500 }
    );
  }
}