import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("leads")
      .select("price, status");

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch leads", details: error.message },
        { status: 500 }
      );
    }

    const leads = data ?? [];

    const revenue = leads.reduce((sum, lead) => {
      const price = typeof lead.price === "number" ? lead.price : 0;
      return sum + price;
    }, 0);

    const billed = leads.filter(
      (lead) => lead.status === "assigned"
    ).length;

    return NextResponse.json(
      {
        success: true,
        revenue,
        leads: leads.length,
        billed,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Server error",
        message: err?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}