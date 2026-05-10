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
    <main style={styles.main}>

      {/* HERO (UPGRADED FOR CONVERSION) */}
      <section style={styles.hero}>
        <h1 style={styles.h1}>
          Launch SaaS products without building backend infrastructure
        </h1>

        <p style={styles.heroSub}>
          Flow OS gives you prebuilt workflows, payments, and automation so you can go from idea → revenue in minutes.
        </p>

        <p style={styles.heroSmall}>
          Stop wasting weeks wiring auth, Stripe, and backend logic. Start shipping real products instead.
        </p>

        <div style={styles.ctaRow}>
          <button style={styles.primaryBtn} onClick={() => checkout("starter")}>
            Start building free
          </button>

          <button
            style={styles.secondaryBtn}
            onClick={() => window.scrollTo({ top: 900, behavior: "smooth" })}
          >
            See pricing
          </button>
        </div>

        <p style={styles.microTrust}>
          No setup fees • Stripe-secured • Cancel anytime
        </p>
      </section>

      {/* TRUST STRIP (NEW - VERY IMPORTANT) */}
      <section style={styles.trust}>
        <p>⚡ Built for indie hackers shipping real SaaS products</p>
        <p>💳 Powered by Stripe infrastructure</p>
        <p>🚀 Designed to replace backend boilerplate</p>
      </section>

      {/* VALUE PROP */}
      <section style={styles.value}>
        <h2>Everything you need to launch and monetize a SaaS</h2>
        <p>No backend setup. No DevOps. No complexity. Just build and launch.</p>
      </section>

      {/* FEATURES */}
      <section style={styles.grid}>
        <div style={styles.card}>
          ⚡ Instant SaaS Setup
          <p>Go from idea to working product in minutes.</p>
        </div>

        <div style={styles.card}>
          🤖 Automation Engine
          <p>Run workflows, users, and logic automatically.</p>
        </div>

        <div style={styles.card}>
          💳 Payments Built-In
          <p>Stripe subscriptions ready out of the box.</p>
        </div>

        <div style={styles.card}>
          🔐 Production Ready
          <p>Secure architecture built for scaling real apps.</p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={styles.section}>
        <h2>How Flow OS works</h2>

        <div style={styles.steps}>
          <div style={styles.card}>
            <h3>1. Choose a system</h3>
            <p>Select a prebuilt SaaS or automation template.</p>
          </div>

          <div style={styles.card}>
            <h3>2. Connect Stripe</h3>
            <p>Enable payments and subscriptions instantly.</p>
          </div>

          <div style={styles.card}>
            <h3>3. Launch & earn</h3>
            <p>Your system runs and starts processing users automatically.</p>
          </div>
        </div>
      </section>

      {/* PRICING (RESTRUCTURED PSYCHOLOGY) */}
      <section style={styles.pricing}>
        <h2>Simple pricing that scales with your growth</h2>
        <p>Start small. Upgrade when you're making revenue.</p>

        <div style={styles.pricingGrid}>

          {/* STARTER */}
          <div style={styles.card}>
            <h3>Starter</h3>
            <p style={styles.price}>$9/mo</p>
            <p>For testing ideas and building your first system.</p>

            <button style={styles.btn} onClick={() => checkout("starter")} disabled={loading}>
              Start Starter
            </button>
          </div>

          {/* GROWTH (PRIMARY FOCUS) */}
          <div style={styles.highlightCard}>
            <h3>Growth ⭐</h3>
            <p style={styles.price}>$29/mo</p>
            <p>Best for launching real SaaS products that generate revenue.</p>

            <button style={styles.btn} onClick={() => checkout("growth")} disabled={loading}>
              Choose Growth
            </button>
          </div>

          {/* ELITE */}
          <div style={styles.card}>
            <h3>Elite</h3>
            <p style={styles.price}>$79/mo</p>
            <p>For agencies and scaling SaaS businesses.</p>

            <button style={styles.btn} onClick={() => checkout("elite")} disabled={loading}>
              Go Elite
            </button>
          </div>

        </div>
      </section>

      {/* FINAL CTA */}
      <section style={styles.final}>
        <h2>Ready to build your first SaaS?</h2>
        <p>Start in minutes and launch something real today.</p>

        <button style={styles.primaryBtn} onClick={() => checkout("starter")}>
          Start now
        </button>
      </section>

      {/* LOADING */}
      {loading && (
        <p style={{ textAlign: "center", marginTop: 30, opacity: 0.7 }}>
          Redirecting to secure checkout...
        </p>
      )}

      {/* FOOTER */}
      <footer style={styles.footer}>
        Flow OS — Replace backend complexity. Ship faster. Earn sooner.
      </footer>
    </main>
  );
}

/* ================= STYLES ================= */

const styles = {
  main: {
    background: "#0b0f17",
    color: "#fff",
    fontFamily: "system-ui",
    padding: "60px 20px",
  },

  hero: {
    maxWidth: 900,
    margin: "0 auto",
    textAlign: "center",
  },

  h1: {
    fontSize: 52,
    marginBottom: 12,
  },

  heroSub: {
    fontSize: 22,
    opacity: 0.9,
    maxWidth: 780,
    margin: "0 auto",
  },

  heroSmall: {
    marginTop: 14,
    fontSize: 14,
    opacity: 0.6,
  },

  ctaRow: {
    marginTop: 30,
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
  },

  microTrust: {
    marginTop: 18,
    fontSize: 12,
    opacity: 0.5,
  },

  trust: {
    textAlign: "center",
    marginTop: 60,
    opacity: 0.7,
    fontSize: 14,
  },

  value: {
    textAlign: "center",
    marginTop: 80,
    maxWidth: 800,
    marginLeft: "auto",
    marginRight: "auto",
  },

  grid: {
    maxWidth: 1000,
    margin: "60px auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
  },

  section: {
    textAlign: "center",
    marginTop: 80,
  },

  steps: {
    display: "grid",
    gap: 18,
    maxWidth: 800,
    margin: "40px auto",
  },

  pricing: {
    textAlign: "center",
    marginTop: 100,
  },

  pricingGrid: {
    display: "flex",
    gap: 20,
    justifyContent: "center",
    marginTop: 40,
    flexWrap: "wrap",
  },

  final: {
    textAlign: "center",
    marginTop: 120,
  },

  footer: {
    textAlign: "center",
    marginTop: 100,
    opacity: 0.5,
  },

  card: {
    background: "#141a2a",
    padding: 24,
    borderRadius: 14,
    width: 260,
  },

  highlightCard: {
    background: "#141a2a",
    padding: 24,
    borderRadius: 14,
    width: 260,
    border: "2px solid #4f7cff",
    transform: "scale(1.05)",
  },

  primaryBtn: {
    background: "#4f7cff",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: 10,
    cursor: "pointer",
  },

  secondaryBtn: {
    background: "transparent",
    color: "#fff",
    border: "1px solid #2a2f3a",
    padding: "12px 18px",
    borderRadius: 10,
    cursor: "pointer",
  },

  btn: {
    marginTop: 15,
    background: "#4f7cff",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: 10,
    width: "100%",
    cursor: "pointer",
  },

  price: {
    fontSize: 22,
  },
};