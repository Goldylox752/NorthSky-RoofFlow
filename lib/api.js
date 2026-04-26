import { supabase } from "./supabase";

export async function getToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
}

const FLOW_API =
  process.env.NEXT_PUBLIC_FLOW_API ||
  "https://northsky-flow-os.onrender.com";

async function request(url, options = {}) {
  const token = await getToken();

  return fetch(`${FLOW_API}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then((r) => r.json());
}