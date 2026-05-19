import { NextResponse } from "next/server";
import crypto from "crypto";
import stripe from "@/lib/stripe";
import supabase from "@/lib/supabase";

const BASE_URL = process.env.CLIENT_URL?.trim();

const PRICES = {
  starter: { amount: 1000 },
  growth: { amount: 2000 },
  elite: { amount: 5000 },
};

const clean = (v: string) =>
  typeof v === "string" ? v.trim().toLowerCase() : "starter";

const generateIdempotencyKey = ({ userId, plan, amount }: any) =>
  crypto.createHash("sha256").update(`${userId}:${plan}:${amount}`).digest("hex");

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userId = body.userId;
    const plan = clean(body.plan);
    const pricing = PRICES[plan as keyof typeof PRICES];

    if (!userId) {
      return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
    }

    if (!pricing) {
      return NextResponse.json({ success: false, error: "invalid_plan" }, { status: 400 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("auth_id", userId)
      .single();

    if (!user?.stripe_customer_id) {
      return NextResponse.json({ success: false, error: "missing_customer" }, { status: 400 });
    }

    const idempotencyKey = generateIdempotencyKey({
      userId,
      plan,
      amount: pricing.amount,
    });

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer: user.stripe_customer_id,
        payment_method_types: ["card"],

        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: pricing.amount,
              product_data: {
                name: `RoofFlow — ${plan}`,
              },
            },
          },
        ],

        metadata: {
          auth_id: userId,
          plan,
          amount: String(pricing.amount),
        },

        success_url: `${BASE_URL}/success`,
        cancel_url: `${BASE_URL}/cancel`,
      },
      { idempotencyKey }
    );

    return NextResponse.json({
      success: true,
      url: session.url,
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}