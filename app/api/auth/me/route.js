import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(req) {
  try {
    const supabase = getSupabaseServer();

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return Response.json({ error: "Missing token" }, { status: 401 });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    return Response.json({ user });
  } catch (err) {
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}