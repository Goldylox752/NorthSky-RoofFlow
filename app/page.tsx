"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const checkout = async (plan: string) => {
    setLoading(true);

    const data = await api("/api/payments/checkout", {
      method: "POST",
      body: JSON.stringify({
        plan,
      }),
    });

    if (data?.url) {
      window.location.href = data.url;
    }

    setLoading(false);
  };

  return (
    <main style={{ padding: 40, color: "#fff", background: "#0b0f17", minHeight: "100vh" }}>
      <h1>Flow OS</h1>
      <p>AI backend + leads + Stripe system</p>

      <div style={{ display: "flex", gap: 20 }}>
        <button onClick={() => checkout("starter")}>
          Starter
        </button>

        <button onClick={() => checkout("growth")}>
          Growth
        </button>

        <button onClick={() => checkout("elite")}>
          Elite
        </button>
      </div>

      {loading && <p>Redirecting...</p>}
    </main>
  );
}