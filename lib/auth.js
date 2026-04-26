import { supabase } from "./supabase";

export async function requireAuth(req) {
  const token = req.headers.get("authorization");

  if (!token) {
    return { error: "Missing token" };
  }

  const accessToken = token.replace("Bearer ", "");

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data?.user) {
    return { error: "Invalid session" };
  }

  // 🔍 get user profile (ROLE)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  return {
    user: data.user,
    profile,
  };
}