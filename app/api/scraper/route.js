import { processLead } from "@/services/leadProcessor";
import { supabase } from "@/lib/supabaseAdmin";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  // 🔒 Rate limit
  if (!rateLimit(ip)) {
    return new Response("Too many requests", { status: 429 });
  }

  try {
    const { url } = await req.json();

    // 🔒 Validate input
    if (!url || typeof url !== "string") {
      return new Response("Invalid URL", { status: 400 });
    }

    if (!url.startsWith("http")) {
      return new Response("Invalid protocol", { status: 400 });
    }

    // 🔒 Timeout protection
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "RoofFlowBot/1.0",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return new Response("Failed to fetch URL", { status: 400 });
    }

    const html = await res.text();

    // 🔥 Extract data
    const title =
      html.match(/<title>(.*?)<\/title>/i)?.[1] ||
      "No title found";

    const emails =
      html.match(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g
      ) || [];

    const phones =
      html.match(
        /(\+?\d{1,2}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g
      ) || [];

    // 🧠 PROCESS LEAD (IMPORTANT FIX)
    const lead = processLead({
      url,
      title,
      emails: [...new Set(emails)],
      phones: [...new Set(phones)],
    });

    // 💾 SAVE TO SUPABASE (INSIDE FUNCTION)
    const { error } = await supabase.from("leads").insert([lead]);

    if (error) {
      console.error("Supabase insert error:", error);
    }

    return Response.json({
      success: true,
      lead,
    });
  } catch (err) {
    return Response.json(
      {
        success: false,
        error: err.message || "Scraper failed",
      },
      { status: 500 }
    );
  }
}
