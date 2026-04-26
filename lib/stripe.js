import { getToken } from "@/lib/auth";

export async function subscribe(priceId, userId) {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId, userId }),
  });

  const data = await res.json();

  window.location.href = data.url;
}