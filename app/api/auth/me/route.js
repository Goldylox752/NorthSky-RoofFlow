import { cookies } from "next/headers";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = getSupabaseServer();

    if (!supabase) {
      return Response.json(
        { error: "Supabase server not configured" },
        { status: 500 }
      );
    }

    /* ===============================
       GET USER FROM SESSION COOKIE
    =============================== */
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return Response.json({
      user,
    });
  } catch (err) {
    return Response.json(
      {
        error: "Server error",
        details: err?.message || "unknown",
      },
      { status: 500 }
    );
  }
}