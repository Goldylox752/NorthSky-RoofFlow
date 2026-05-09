"use client";

import { useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "$99",
    color: "#111827",
  },
  {
    id: "growth",
    name: "Growth",
    price: "$199",
    color: "#2563eb",
  },
  {
    id: "elite",
    name: "Elite",
    price: "$499",
    color: "#16a34a",
  },
];

export default function Buy() {
  const [loadingPlan, setLoadingPlan] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const buy = async (
    planId: string
  ) => {
    try {
      setError("");
      setLoadingPlan(planId);

      if (!API_URL) {
        throw new Error(
          "Missing NEXT_PUBLIC_API_URL"
        );
      }

      const res = await fetch(
        `${API_URL}/api/checkout`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            plan: planId,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok || !data?.url) {
        throw new Error(
          data?.error ||
            "Checkout failed"
        );
      }

      window.location.href =
        data.url;
    } catch (err: any) {
      console.error(err);

      setError(
        err.message ||
          "Something went wrong"
      );

      setLoadingPlan(null);
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>
          Buy Roofing Leads
        </h1>

        <p style={styles.sub}>
          Secure Stripe checkout with
          instant access to contractor
          leads.
        </p>

        {error && (
          <div style={styles.error}>
            ⚠️ {error}
          </div>
        )}

        {plans.map((plan) => (
          <button
            key={plan.id}
            onClick={() =>
              buy(plan.id)
            }
            disabled={
              !!loadingPlan
            }
            style={{
              ...styles.btn,
              background:
                plan.color,
              opacity:
                loadingPlan &&
                loadingPlan !==
                  plan.id
                  ? 0.5
                  : 1,
            }}
          >
            {loadingPlan ===
            plan.id
              ? "Redirecting..."
              : `${plan.name} — ${plan.price}`}
          </button>
        ))}

        <p style={styles.note}>
          Secure payments powered
          by Stripe
        </p>
      </div>
    </main>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#0b0f17",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    fontFamily:
      "system-ui, sans-serif",
  },

  container: {
    width: "100%",
    maxWidth: 520,
    background:
      "rgba(17,24,39,0.9)",
    padding: 32,
    borderRadius: 18,
    border:
      "1px solid rgba(255,255,255,0.08)",
  },

  title: {
    fontSize: 42,
    marginBottom: 12,
    fontWeight: 800,
  },

  sub: {
    opacity: 0.7,
    marginBottom: 28,
    lineHeight: 1.6,
  },

  btn: {
    width: "100%",
    padding: 16,
    marginBottom: 14,
    color: "#fff",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 16,
    transition:
      "all 0.2s ease",
  },

  error: {
    background:
      "rgba(127,29,29,0.3)",
    border:
      "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5",
    padding: 14,
    borderRadius: 10,
    marginBottom: 18,
  },

  note: {
    marginTop: 18,
    fontSize: 13,
    opacity: 0.5,
    textAlign: "center",
  },
};