import { safeFetch } from "./client";

/* ===============================
   CREATE PORTAL SESSION
=============================== */
export async function createBillingPortal(email: string) {
  const data = await safeFetch("/api/billing/portal", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  if (!data?.url) {
    throw new Error("Missing portal URL");
  }

  return data;
}

/* ===============================
   GET CUSTOMER INFO
=============================== */
export async function getCustomer(email: string) {
  return safeFetch(`/api/billing/customer?email=${email}`);
}

/* ===============================
   CANCEL SUBSCRIPTION
=============================== */
export async function cancelSubscription(email: string) {
  return safeFetch("/api/billing/cancel", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}