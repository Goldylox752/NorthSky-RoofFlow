"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const checkout = async (plan: string) => {
    setLoading(true);

    const data = await api("/api/payments/checkout", {
      method: "POST",
      body: JSON.stringify({ plan }),
    });

    if (data?.url) {
      window.location.href = data.url;
    }

    setLoading(false);
  };

  return (
    <main style={{
      background: "#0b0f17",
      color: "#fff",
      minHeight: "100vh",
      padding: "60px 20px",
      fontFamily: "system-ui"
    }}>

      {/* HERO */}
      <section style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontSize: 48, marginBottom: 10 }}>
          Flow OS
        </h1>

        <p style={{ fontSize: 18, opacity: 0.8 }}>
          AI-powered backend system for automation, leads, and Stripe workflows.
        </p>

        <p style={{ marginTop: 10, opacity: 0.6 }}>
          Build faster. Automate smarter. Launch without complexity.
        </p>
      </section>

      {/* FEATURES */}
      <section style={{
        maxWidth: 900,
        margin: "60px auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 20
      }}>
        <div style={card}>
          ⚡ Fast Setup
          <p style={sub}>Get your backend running in minutes.</p>
        </div>

        <div style={card}>
          🤖 AI Ready
          <p style={sub}>Built for automation + intelligent workflows.</p>
        </div>

        <div style={card}>
          💳 Stripe Integrated
          <p style={sub}>Payments, subscriptions, checkout flow included.</p>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <h2>Simple Pricing</h2>

        <div style={{
          display: "flex",
          gap: 20,
          justifyContent: "center",
          marginTop: 30,
          flexWrap: "wrap"
        }}>

          <div style={card}>
            <h3>Starter</h3>
            <p>$9/mo</p>
            <button onClick={() => checkout("starter")} disabled={loading}>
              Get Starter
            </button>
          </div>

          <div style={{ ...card, border: "2px solid #4f7cff" }}>
            <h3>Growth</h3>
            <p>$29/mo</p>
            <button onClick={() => checkout("growth")} disabled={loading}>
              Get Growth
            </button>
          </div>

          <div style={card}>
            <h3>Elite</h3>
            <p>$79/mo</p>
            <button onClick={() => checkout("elite")} disabled={loading}>
              Get Elite
            </button>
          </div>

        </div>
      </section>

      {/* LOADING */}
      {loading && (
        <p style={{ textAlign: "center", marginTop: 40, opacity: 0.7 }}>
          Redirecting to checkout...
        </p>
      )}

      {/* FOOTER */}
      <footer style={{ textAlign: "center", marginTop: 80, opacity: 0.5 }}>
        Flow OS • Built for modern automation systems
      </footer>
    </main>
  );
}

const card = {
  background: "#141a2a",
  padding: 20,
  borderRadius: 12,
  textAlign: "center",
};

const sub = {
  fontSize: 14,
  opacity: 0.7,
  marginTop: 8,
};