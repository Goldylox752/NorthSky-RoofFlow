import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function getUserFromRequest(req) {
  const token = req.headers.get("authorization");

  if (!token) return null;

  const accessToken = token.replace("Bearer ", "");

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) return null;

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