"use client";

import { useRouter } from "next/navigation";

export default function HomeClient() {
  const router = useRouter();

  const go = (plan: string) => {
    router.push(`/checkout?plan=${plan}`);
  };

  return (
    <main style={styles.page}>
      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.badge}>Production-ready SaaS starter kit</div>

        <h1 style={styles.title}>
          Build and launch your SaaS in days, not months
        </h1>

        <p style={styles.subtitle}>
          Everything you need is already built: authentication, Stripe billing,
          subscriptions, feature gating, and scalable backend architecture.
        </p>

        <div style={styles.ctaRow}>
          <button style={styles.primary} onClick={() => go("starter")}>
            Start for $9/month
          </button>
          <button style={styles.secondary} onClick={() => go("growth")}>
            View plans
          </button>
        </div>

        <p style={styles.micro}>
          No setup. No boilerplate hell. Ship immediately.
        </p>
      </section>

      {/* TRUST STRIP */}
      <section style={styles.trust}>
        <p>Built with production-grade systems used in real SaaS products</p>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section style={styles.section}>
        <h2>Stop wasting months building SaaS infrastructure</h2>

        <div style={styles.grid}>
          <div>
            <h3>Before</h3>
            <ul>
              <li>Auth from scratch</li>
              <li>Stripe integration headaches</li>
              <li>No subscription logic</li>
              <li>Broken scaling setup</li>
            </ul>
          </div>

          <div>
            <h3>After</h3>
            <ul>
              <li>Ready-to-use auth system</li>
              <li>Stripe billing prebuilt</li>
              <li>Plan-based feature control</li>
              <li>Production-ready backend</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={styles.section}>
        <h2>Everything included</h2>

        <ul style={styles.features}>
          <li>JWT authentication + session control</li>
          <li>Stripe subscriptions & webhooks</li>
          <li>Plan-based feature gating</li>
          <li>Lead + pricing engine system</li>
          <li>Rate limiting + security middleware</li>
          <li>Scalable Express architecture</li>
        </ul>
      </section>

      {/* PRICING */}
      <section style={styles.section}>
        <h2>Simple pricing</h2>

        <div style={styles.pricing}>
          <div style={styles.card}>
            <h3>Starter</h3>
            <p style={styles.price}>$9</p>
            <button onClick={() => go("starter")}>Get Starter</button>
          </div>

          <div style={styles.card}>
            <h3>Growth</h3>
            <p style={styles.price}>$29</p>
            <button onClick={() => go("growth")}>Get Growth</button>
          </div>

          <div style={styles.card}>
            <h3>Elite</h3>
            <p style={styles.price}>$79</p>
            <button onClick={() => go("elite")}>Get Elite</button>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={styles.final}>
        <h2>Launch your SaaS today</h2>
        <button style={styles.primary} onClick={() => go("starter")}>
          Start now
        </button>
      </section>
    </main>
  );
}

/* ===============================
   STYLES (simple but structured)
=============================== */
const styles: any = {
  page: {
    background: "#0b0f17",
    color: "#fff",
    fontFamily: "sans-serif",
  },

  hero: {
    padding: "100px 24px",
    textAlign: "center",
    maxWidth: 900,
    margin: "0 auto",
  },

  badge: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 16,
  },

  title: {
    fontSize: 44,
    fontWeight: 700,
    lineHeight: 1.2,
  },

  subtitle: {
    marginTop: 16,
    fontSize: 18,
    opacity: 0.75,
  },

  ctaRow: {
    marginTop: 28,
    display: "flex",
    justifyContent: "center",
    gap: 12,
  },

  primary: {
    padding: "12px 20px",
    background: "#4f46e5",
    border: "none",
    color: "#fff",
    cursor: "pointer",
  },

  secondary: {
    padding: "12px 20px",
    background: "transparent",
    border: "1px solid #333",
    color: "#fff",
    cursor: "pointer",
  },

  micro: {
    marginTop: 12,
    fontSize: 12,
    opacity: 0.5,
  },

  trust: {
    textAlign: "center",
    padding: "30px 20px",
    opacity: 0.6,
    borderTop: "1px solid #1a1f2e",
    borderBottom: "1px solid #1a1f2e",
  },

  section: {
    padding: "80px 24px",
    maxWidth: 1000,
    margin: "0 auto",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 40,
    marginTop: 20,
  },

  features: {
    marginTop: 20,
    lineHeight: 1.8,
  },

  pricing: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginTop: 20,
  },

  card: {
    border: "1px solid #222",
    padding: 20,
  },

  price: {
    fontSize: 28,
    margin: "10px 0",
  },

  final: {
    padding: "100px 24px",
    textAlign: "center",
  },
};