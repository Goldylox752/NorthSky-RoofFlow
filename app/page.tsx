"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const checkout = async (plan: string) => {
    setLoading(true);

    try {
      const data = await api("/api/payments/checkout", {
        method: "POST",
        body: JSON.stringify({ plan }),
      });

      if (!data?.url) {
        alert("Checkout failed. Please try again.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      alert("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <main
      style={{
        background: "#0b0f17",
        color: "#fff",
        minHeight: "100vh",
        padding: "60px 20px",
        fontFamily: "system-ui",
      }}
    >

      {/* HERO */}
      <section style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontSize: 58, marginBottom: 12 }}>
          Flow OS
        </h1>

        <p style={{ fontSize: 24, opacity: 0.95, maxWidth: 780, margin: "0 auto" }}>
          Build, automate, and launch SaaS products faster than ever.
        </p>

        <p style={{ marginTop: 18, fontSize: 16, opacity: 0.7, maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
          Flow OS gives you a complete backend system for workflows, payments, and automation —
          so you can ship real products without infrastructure complexity.
        </p>

        <p style={{ marginTop: 14, fontSize: 14, opacity: 0.6 }}>
          Built for founders, developers, and indie hackers launching real businesses.
        </p>

        {/* CTA */}
        <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            style={primaryBtn}
            onClick={() => checkout("starter")}
          >
            Start building
          </button>

          <button
            style={secondaryBtn}
            onClick={() => window.scrollTo({ top: 900, behavior: "smooth" })}
          >
            View pricing
          </button>
        </div>

        <p style={{ marginTop: 18, fontSize: 13, opacity: 0.55 }}>
          Secure payments via Stripe • Cancel anytime • No setup fees
        </p>
      </section>

      {/* VALUE PROP STRIP */}
      <section style={{ maxWidth: 900, margin: "80px auto", textAlign: "center" }}>
        <h2 style={{ fontSize: 28 }}>
          Everything you need to launch a SaaS product
        </h2>

        <p style={{ opacity: 0.6, marginTop: 10 }}>
          No backend setup. No infrastructure headaches. Just build and ship.
        </p>
      </section>

      {/* FEATURES */}
      <section
        style={{
          maxWidth: 1000,
          margin: "60px auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
        }}
      >
        <div style={card}>
          ⚡ Instant Setup
          <p style={sub}>
            Go from idea to working SaaS backend in minutes.
          </p>
        </div>

        <div style={card}>
          🤖 Automation Engine
          <p style={sub}>
            Automate workflows, users, and business logic end-to-end.
          </p>
        </div>

        <div style={card}>
          💳 Payments Built-In
          <p style={sub}>
            Accept subscriptions and payments instantly with Stripe.
          </p>
        </div>

        <div style={card}>
          🔐 Production Ready
          <p style={sub}>
            Secure architecture built for real-world SaaS scaling.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <h2>How Flow OS works</h2>

        <div style={{ marginTop: 40, display: "grid", gap: 18 }}>
          <div style={card}>
            <h3>1. Build your system</h3>
            <p style={sub}>Choose or create workflows for your SaaS product.</p>
          </div>

          <div style={card}>
            <h3>2. Connect payments</h3>
            <p style={sub}>Enable Stripe billing, subscriptions, and checkout flows.</p>
          </div>

          <div style={card}>
            <h3>3. Launch & scale</h3>
            <p style={sub}>Your system runs automatically and grows with your users.</p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ maxWidth: 1100, margin: "100px auto", textAlign: "center" }}>
        <h2 style={{ fontSize: 34 }}>
          Simple pricing that grows with you
        </h2>

        <p style={{ opacity: 0.6, marginTop: 10 }}>
          Start small, validate your idea, and scale when you're ready.
        </p>

        <div
          style={{
            display: "flex",
            gap: 20,
            justifyContent: "center",
            marginTop: 40,
            flexWrap: "wrap",
          }}
        >

          {/* STARTER */}
          <div style={card}>
            <h3>Starter</h3>
            <p style={{ fontSize: 22 }}>$9/mo</p>

            <p style={sub}>
              Perfect for testing and building your first system.
            </p>

            <ul style={list}>
              <li>Basic workflows</li>
              <li>Stripe integration</li>
              <li>Core automation tools</li>
            </ul>

            <button style={btn} onClick={() => checkout("starter")} disabled={loading}>
              Start Starter
            </button>
          </div>

          {/* GROWTH */}
          <div style={{ ...card, border: "2px solid #4f7cff", transform: "scale(1.05)" }}>
            <h3>Growth ⭐</h3>
            <p style={{ fontSize: 22 }}>$29/mo</p>

            <p style={sub}>
              Best for launching real SaaS products and getting paying users.
            </p>

            <ul style={list}>
              <li>Advanced workflows</li>
              <li>Scalable automation engine</li>
              <li>Production-ready setup</li>
              <li>Priority performance</li>
            </ul>

            <button style={btn} onClick={() => checkout("growth")} disabled={loading}>
              Upgrade to Growth
            </button>
          </div>

          {/* ELITE */}
          <div style={card}>
            <h3>Elite</h3>
            <p style={{ fontSize: 22 }}>$79/mo</p>

            <p style={sub}>
              For agencies and high-scale SaaS systems.
            </p>

            <ul style={list}>
              <li>Full automation suite</li>
              <li>Advanced integrations</li>
              <li>Premium support</li>
              <li>High-scale architecture</li>
            </ul>

            <button style={btn} onClick={() => checkout("elite")} disabled={loading}>
              Go Elite
            </button>
          </div>

        </div>
      </section>

      {/* LOADING */}
      {loading && (
        <p style={{ textAlign: "center", marginTop: 40, opacity: 0.7 }}>
          Redirecting to secure checkout...
        </p>
      )}

      {/* FINAL CTA */}
      <section style={{ textAlign: "center", marginTop: 120 }}>
        <h2>Ready to launch your SaaS?</h2>
        <p style={{ opacity: 0.6 }}>
          Start building your system in minutes.
        </p>

        <button
          style={{ ...primaryBtn, marginTop: 20 }}
          onClick={() => checkout("starter")}
        >
          Start now
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ textAlign: "center", marginTop: 100, opacity: 0.5 }}>
        Flow OS — Build faster. Automate everything. Launch real products.
      </footer>
    </main>
  );
}

/* STYLES */

const card = {
  background: "#141a2a",
  padding: 24,
  borderRadius: 14,
  textAlign: "center",
  width: 260,
};

const sub = {
  fontSize: 14,
  opacity: 0.75,
  marginTop: 10,
};

const list = {
  textAlign: "left",
  marginTop: 15,
  fontSize: 14,
  opacity: 0.8,
};

const primaryBtn = {
  background: "#4f7cff",
  color: "#fff",
  border: "none",
  padding: "12px 18px",
  borderRadius: 10,
  cursor: "pointer",
};

const secondaryBtn = {
  background: "transparent",
  color: "#fff",
  border: "1px solid #2a2f3a",
  padding: "12px 18px",
  borderRadius: 10,
  cursor: "pointer",
};

const btn = {
  marginTop: 15,
  background: "#4f7cff",
  color: "#fff",
  border: "none",
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
  width: "100%",
};