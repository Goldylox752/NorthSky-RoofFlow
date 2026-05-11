"use client";

import { useMemo, useState } from "react";
import { api } from "@/lib/api";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "$9/mo",
    description:
      "Perfect for validating ideas quickly",
    cta: "Start Free",
  },

  {
    id: "growth",
    name: "Growth",
    price: "$29/mo",
    description:
      "Best for launching real SaaS products",
    cta: "Choose Growth",
    featured: true,
  },

  {
    id: "elite",
    name: "Elite",
    price: "$79/mo",
    description:
      "Scale automation, teams, and workflows",
    cta: "Go Elite",
  },
];

export default function Home() {
  const [loadingPlan, setLoadingPlan] =
    useState(null);

  const [error, setError] =
    useState("");

  const year = useMemo(
    () => new Date().getFullYear(),
    []
  );

  const checkout = async (plan) => {
    if (loadingPlan) return;

    try {
      setError("");
      setLoadingPlan(plan);

      const data = await api(
        "/api/payments/checkout",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            plan,
          }),
        }
      );

      const checkoutUrl =
        data?.checkout?.url ||
        data?.url;

      if (!checkoutUrl) {
        throw new Error(
          "Checkout session unavailable"
        );
      }

      window.location.assign(
        checkoutUrl
      );

    } catch (err) {
      console.error(
        "❌ Checkout failed:",
        err
      );

      setError(
        err?.message ||
          "Unable to start checkout"
      );

    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <main style={styles.main}>

      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.logo}>
          NorthSky Flow OS
        </div>

        <div style={styles.navLinks}>
          <a
            href="#pricing"
            style={styles.link}
          >
            Pricing
          </a>

          <a
            href="#features"
            style={styles.link}
          >
            Features
          </a>

          <button
            style={styles.navBtn}
            onClick={() =>
              checkout("growth")
            }
          >
            Start Free
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.badge}>
          AI-Powered SaaS Launch Platform
        </div>

        <h1 style={styles.h1}>
          Launch SaaS products without
          backend complexity
        </h1>

        <p style={styles.subHero}>
          Payments, authentication,
          workflows, automation, and
          infrastructure — already built.
        </p>

        <p style={styles.mini}>
          Go from idea → live product in
          minutes instead of weeks.
        </p>

        <div style={styles.ctaRow}>
          <button
            style={styles.primaryBtn}
            onClick={() =>
              checkout("starter")
            }
            disabled={!!loadingPlan}
          >
            {loadingPlan === "starter"
              ? "Redirecting..."
              : "Start Building"}
          </button>

          <a
            href="#pricing"
            style={styles.secondaryBtn}
          >
            View Pricing
          </a>
        </div>

        <div style={styles.socialProof}>
          <span>
            ✔ Stripe-secured
          </span>

          <span>
            ✔ Cancel anytime
          </span>

          <span>
            ✔ Production-ready
          </span>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        style={styles.section}
      >
        <h2 style={styles.sectionTitle}>
          Everything required to launch
        </h2>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>
              Authentication
            </h3>

            <p>
              User accounts and auth
              systems already integrated.
            </p>
          </div>

          <div style={styles.card}>
            <h3>
              Stripe Payments
            </h3>

            <p>
              Accept payments instantly
              with secure checkout flows.
            </p>
          </div>

          <div style={styles.card}>
            <h3>
              Workflow Automation
            </h3>

            <p>
              Automate onboarding,
              notifications, and user
              actions.
            </p>
          </div>

          <div style={styles.card}>
            <h3>
              Production Deployment
            </h3>

            <p>
              Launch scalable SaaS apps
              without backend setup.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>
          How it works
        </h2>

        <div style={styles.steps}>
          <div style={styles.step}>
            <span style={styles.stepNum}>
              1
            </span>

            <h3>
              Choose a plan
            </h3>

            <p>
              Start with a launch-ready
              SaaS infrastructure stack.
            </p>
          </div>

          <div style={styles.step}>
            <span style={styles.stepNum}>
              2
            </span>

            <h3>
              Connect Stripe
            </h3>

            <p>
              Enable secure payments in
              minutes.
            </p>
          </div>

          <div style={styles.step}>
            <span style={styles.stepNum}>
              3
            </span>

            <h3>
              Launch
            </h3>

            <p>
              Deploy and scale your SaaS
              product immediately.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        style={styles.pricing}
      >
        <h2 style={styles.sectionTitle}>
          Simple pricing
        </h2>

        <p style={styles.pricingText}>
          Start free and upgrade when
          you're ready to scale.
        </p>

        <div style={styles.pricingGrid}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              style={
                plan.featured
                  ? styles.highlightCard
                  : styles.card
              }
            >
              {plan.featured && (
                <div style={styles.popular}>
                  MOST POPULAR
                </div>
              )}

              <h3>
                {plan.name}
              </h3>

              <p style={styles.price}>
                {plan.price}
              </p>

              <p>
                {plan.description}
              </p>

              <button
                style={styles.btn}
                onClick={() =>
                  checkout(plan.id)
                }
                disabled={
                  loadingPlan === plan.id
                }
              >
                {loadingPlan === plan.id
                  ? "Redirecting..."
                  : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p style={styles.afterPay}>
          Secure checkout powered by
          Stripe.
        </p>
      </section>

      {/* FINAL CTA */}
      <section style={styles.final}>
        <h2>
          Ship faster than traditional
          SaaS stacks
        </h2>

        <p>
          Launch products without wasting
          weeks building infrastructure.
        </p>

        <button
          style={styles.primaryBtn}
          onClick={() =>
            checkout("growth")
          }
          disabled={!!loadingPlan}
        >
          Start Launching
        </button>
      </section>

      {/* ERROR */}
      {!!error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div>
          © {year} NorthSky Flow OS
        </div>

        <div style={styles.footerLinks}>
          <a href="/privacy">
            Privacy
          </a>

          <a href="/terms">
            Terms
          </a>

          <a href="/contact">
            Contact
          </a>
        </div>
      </footer>
    </main>
  );
}

const styles = {
  main: {
    background: "#050505",
    color: "#ffffff",
    minHeight: "100vh",
    fontFamily:
      "Inter, sans-serif",
  },

  nav: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    padding: "24px 40px",
    borderBottom:
      "1px solid rgba(255,255,255,0.08)",
  },

  logo: {
    fontSize: 20,
    fontWeight: 700,
  },

  navLinks: {
    display: "flex",
    gap: 18,
    alignItems: "center",
  },

  link: {
    color: "#bbb",
    textDecoration: "none",
    fontSize: 14,
  },

  navBtn: {
    background: "#22c55e",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },

  hero: {
    maxWidth: 900,
    margin: "0 auto",
    padding:
      "120px 24px 80px",
    textAlign: "center",
  },

  badge: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: 999,
    background:
      "rgba(34,197,94,0.12)",
    color: "#86efac",
    fontSize: 13,
    marginBottom: 24,
  },

  h1: {
    fontSize: 62,
    lineHeight: 1.05,
    marginBottom: 24,
    fontWeight: 800,
  },

  subHero: {
    fontSize: 22,
    opacity: 0.9,
    lineHeight: 1.6,
    maxWidth: 720,
    margin:
      "0 auto 20px auto",
  },

  mini: {
    opacity: 0.65,
    marginBottom: 36,
  },

  ctaRow: {
    display: "flex",
    justifyContent:
      "center",
    gap: 16,
    flexWrap: "wrap",
  },

  primaryBtn: {
    background: "#22c55e",
    color: "#fff",
    border: "none",
    padding: "16px 28px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 16,
  },

  secondaryBtn: {
    border:
      "1px solid rgba(255,255,255,0.15)",
    padding: "16px 28px",
    borderRadius: 10,
    color: "#fff",
    textDecoration: "none",
  },

  socialProof: {
    marginTop: 30,
    display: "flex",
    justifyContent:
      "center",
    gap: 20,
    opacity: 0.7,
    flexWrap: "wrap",
    fontSize: 14,
  },

  section: {
    padding: "90px 24px",
    maxWidth: 1200,
    margin: "0 auto",
  },

  sectionTitle: {
    textAlign: "center",
    fontSize: 40,
    marginBottom: 50,
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 24,
  },

  card: {
    background:
      "rgba(255,255,255,0.04)",
    border:
      "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 28,
  },

  steps: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 24,
  },

  step: {
    textAlign: "center",
  },

  stepNum: {
    display: "inline-flex",
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    marginBottom: 18,
  },

  pricing: {
    padding:
      "100px 24px 120px",
    background:
      "rgba(255,255,255,0.02)",
  },

  pricingText: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 40,
  },

  pricingGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 24,
    maxWidth: 1100,
    margin: "0 auto",
  },

  highlightCard: {
    background:
      "linear-gradient(to bottom, rgba(34,197,94,0.12), rgba(255,255,255,0.04))",
    border:
      "1px solid rgba(34,197,94,0.35)",
    borderRadius: 18,
    padding: 28,
    position: "relative",
  },

  popular: {
    position: "absolute",
    top: 16,
    right: 16,
    background: "#22c55e",
    color: "#fff",
    fontSize: 11,
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 700,
  },

  price: {
    fontSize: 38,
    fontWeight: 800,
    margin:
      "14px 0 14px",
  },

  btn: {
    width: "100%",
    marginTop: 24,
    background: "#22c55e",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },

  afterPay: {
    textAlign: "center",
    marginTop: 30,
    opacity: 0.6,
  },

  final: {
    textAlign: "center",
    padding:
      "120px 24px",
    maxWidth: 900,
    margin: "0 auto",
  },

  error: {
    maxWidth: 600,
    margin:
      "0 auto 40px auto",
    background:
      "rgba(239,68,68,0.12)",
    border:
      "1px solid rgba(239,68,68,0.25)",
    padding: 16,
    borderRadius: 10,
    textAlign: "center",
    color: "#fca5a5",
  },

  footer: {
    borderTop:
      "1px solid rgba(255,255,255,0.08)",
    padding: "30px 24px",
    display: "flex",
    justifyContent:
      "space-between",
    flexWrap: "wrap",
    gap: 16,
    opacity: 0.7,
    fontSize: 14,
  },

  footerLinks: {
    display: "flex",
    gap: 18,
  },
};