"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const checkout = async (plan) => {
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

      {/* HERO (ROAS OPTIMIZED) */}
      <section style={styles.hero}>
        <h1 style={styles.h1}>
          Launch SaaS products without building backend infrastructure
        </h1>

        <p style={styles.subHero}>
          Flow OS replaces your backend stack with ready-to-use workflows, payments, and automation so you can go from idea → revenue in minutes.
        </p>

        <p style={styles.mini}>
          Stop spending weeks wiring Stripe, auth, and APIs from scratch.
        </p>

        <div style={styles.ctaRow}>
          <button style={styles.primaryBtn} onClick={() => checkout("starter")}>
            Start building free
          </button>

          <button style={styles.secondaryBtn}>
            See pricing
          </button>
        </div>

        <p style={styles.trustLine}>
          Stripe-secured • No setup fees • Cancel anytime
        </p>
      </section>

      {/* TRUST STRIP */}
      <section style={styles.trust}>
        Built for indie hackers and founders launching real SaaS products
      </section>

      {/* PROBLEM SECTION (HIGH CONVERSION DRIVER) */}
      <section style={styles.problem}>
        <h2>Most SaaS ideas never launch because backend setup takes too long</h2>

        <p>
          Auth, payments, APIs, infrastructure — all of it slows you down before you even get users.
        </p>

        <p style={{ opacity: 0.7 }}>
          Flow OS removes that entire layer so you can focus on building and selling.
        </p>
      </section>

      {/* VALUE STACK (NOT FEATURES) */}
      <section style={styles.grid}>
        <div style={styles.card}>✔ Launch SaaS without backend setup</div>
        <div style={styles.card}>✔ Accept Stripe payments instantly</div>
        <div style={styles.card}>✔ Automate workflows & users</div>
        <div style={styles.card}>✔ Deploy production-ready systems in minutes</div>
      </section>

      {/* COMPARISON (HIGH ROAS BLOCK) */}
      <section style={styles.compare}>
        <h2>Stop building everything from scratch</h2>

        <div style={styles.table}>
          <div>
            <h3>Traditional way</h3>
            <p>Weeks of backend setup</p>
            <p>Stripe integration headaches</p>
            <p>Auth + APIs + infrastructure</p>
          </div>

          <div style={styles.highlightColumn}>
            <h3>Flow OS</h3>
            <p>Ready-made SaaS backend</p>
            <p>Stripe built-in</p>
            <p>Launch in minutes</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={styles.section}>
        <h2>How Flow OS works</h2>

        <div style={styles.steps}>
          <div style={styles.card}>
            1. Choose a SaaS template
          </div>

          <div style={styles.card}>
            2. Connect Stripe in 1 click
          </div>

          <div style={styles.card}>
            3. Launch and start earning
          </div>
        </div>

        <p style={{ opacity: 0.6 }}>
          Your backend is already built. You just customize and launch.
        </p>
      </section>

      {/* PRICING (ROAS STRUCTURE) */}
      <section style={styles.pricing}>
        <h2>Simple pricing for builders</h2>
        <p>Start free. Upgrade when you're ready to scale.</p>

        <div style={styles.pricingGrid}>

          <div style={styles.card}>
            <h3>Starter</h3>
            <p>$9/mo</p>
            <p>For testing ideas</p>
            <button style={styles.btn} onClick={() => checkout("starter")}>
              Start Starter
            </button>
          </div>

          <div style={styles.highlightCard}>
            <h3>Growth ⭐</h3>
            <p>$29/mo</p>
            <p>Best for launching SaaS products</p>
            <button style={styles.btn} onClick={() => checkout("growth")}>
              Choose Growth
            </button>
          </div>

          <div style={styles.card}>
            <h3>Elite</h3>
            <p>$79/mo</p>
            <p>For agencies & scaling teams</p>
            <button style={styles.btn} onClick={() => checkout("elite")}>
              Go Elite
            </button>
          </div>

        </div>

        <p style={styles.afterPay}>
          After checkout, your system is instantly active and ready to use.
        </p>
      </section>

      {/* FINAL CTA */}
      <section style={styles.final}>
        <h2>Ready to launch your SaaS faster?</h2>
        <p>Start building in minutes instead of weeks.</p>

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
        Flow OS — Replace backend complexity. Launch faster. Earn sooner.
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
    textAlign: "center",
    maxWidth: 900,
    margin: "0 auto",
  },

  h1: {
    fontSize: 54,
  },

  subHero: {
    fontSize: 22,
    opacity: 0.9,
    marginTop: 10,
  },

  mini: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 10,
  },

  ctaRow: {
    marginTop: 30,
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
  },

  trustLine: {
    marginTop: 18,
    fontSize: 12,
    opacity: 0.5,
  },

  trust: {
    textAlign: "center",
    marginTop: 60,
    opacity: 0.7,
  },

  problem: {
    textAlign: "center",
    maxWidth: 800,
    margin: "80px auto",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
    maxWidth: 1000,
    margin: "60px auto",
  },

  compare: {
    textAlign: "center",
    marginTop: 80,
  },

  table: {
    display: "flex",
    justifyContent: "center",
    gap: 40,
    marginTop: 30,
    flexWrap: "wrap",
  },

  highlightColumn: {
    border: "2px solid #4f7cff",
    padding: 20,
    borderRadius: 12,
  },

  section: {
    textAlign: "center",
    marginTop: 80,
  },

  steps: {
    display: "grid",
    gap: 15,
    maxWidth: 700,
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

  afterPay: {
    marginTop: 20,
    opacity: 0.6,
    fontSize: 13,
  },
};