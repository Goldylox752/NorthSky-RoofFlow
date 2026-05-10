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
          Build and launch SaaS products without backend complexity
        </h1>

        <p style={styles.subHero}>
          Flow OS replaces your entire backend stack — auth, payments, workflows, and automation — so you can go from idea → live product in minutes.
        </p>

        <p style={styles.mini}>
          Stop wasting weeks building infrastructure before you can even launch.
        </p>

        <div style={styles.ctaRow}>
          <button style={styles.primaryBtn} onClick={() => checkout("starter")}>
            Start building free
          </button>

          <button style={styles.secondaryBtn}>
            View pricing
          </button>
        </div>

        <p style={styles.trustLine}>
          Stripe-secured • No setup fees • Cancel anytime
        </p>
      </section>

      {/* TRUST STRIP */}
      <section style={styles.trust}>
        Built for founders shipping real SaaS products faster than traditional stacks
      </section>

      {/* PROBLEM */}
      <section style={styles.problem}>
        <h2>
          Most SaaS ideas never launch because backend setup takes too long
        </h2>

        <p>
          By the time you wire Stripe, auth, APIs, and infrastructure — most ideas lose momentum.
        </p>

        <p style={{ opacity: 0.7 }}>
          Flow OS removes the entire backend layer so you can focus on building and selling.
        </p>
      </section>

      {/* VALUE STACK */}
      <section style={styles.grid}>
        <div style={styles.card}>✔ Launch SaaS without backend setup</div>
        <div style={styles.card}>✔ Accept Stripe payments instantly</div>
        <div style={styles.card}>✔ Automate workflows & user systems</div>
        <div style={styles.card}>✔ Deploy production-ready apps in minutes</div>
      </section>

      {/* COMPARISON */}
      <section style={styles.compare}>
        <h2>Stop building everything from scratch</h2>

        <div style={styles.table}>
          <div>
            <h3>Traditional stack</h3>
            <p>Weeks of backend setup</p>
            <p>Complex Stripe integration</p>
            <p>Auth + APIs + infrastructure</p>
          </div>

          <div style={styles.highlightColumn}>
            <h3>Flow OS</h3>
            <p>Ready-to-launch backend</p>
            <p>Stripe built-in</p>
            <p>Launch in minutes</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={styles.section}>
        <h2>How Flow OS works</h2>

        <div style={styles.steps}>
          <div style={styles.card}>1. Choose a SaaS template</div>
          <div style={styles.card}>2. Connect Stripe in 1 click</div>
          <div style={styles.card}>3. Launch your product instantly</div>
        </div>

        <p style={{ opacity: 0.6 }}>
          Your backend is already built — you just activate it.
        </p>
      </section>

      {/* PRICING */}
      <section style={styles.pricing}>
        <h2>Simple pricing for builders</h2>
        <p>Start free. Upgrade when you're ready to launch seriously.</p>

        <p style={{ opacity: 0.6, marginTop: 8 }}>
          Most users upgrade to Growth after launching their first system.
        </p>

        <div style={styles.pricingGrid}>

          <div style={styles.card}>
            <h3>Starter</h3>
            <p>$9/mo</p>
            <p>For testing ideas quickly</p>
            <button style={styles.btn} onClick={() => checkout("starter")}>
              Start Starter
            </button>
          </div>

          <div style={styles.highlightCard}>
            <h3>Growth ⭐</h3>
            <p>$29/mo</p>
            <p>Best for launching real SaaS products</p>
            <button style={styles.btn} onClick={() => checkout("growth")}>
              Choose Growth
            </button>
          </div>

          <div style={styles.card}>
            <h3>Elite</h3>
            <p>$79/mo</p>
            <p>For scaling SaaS businesses & teams</p>
            <button style={styles.btn} onClick={() => checkout("elite")}>
              Go Elite
            </button>
          </div>

        </div>

        <p style={styles.afterPay}>
          Your system activates instantly after checkout — no setup required.
        </p>
      </section>

      {/* FINAL CTA */}
      <section style={styles.final}>
        <h2>Ready to ship your first SaaS in minutes?</h2>
        <p>Go from idea → live product without backend complexity.</p>

        <button style={styles.primaryBtn} onClick={() => checkout("starter")}>
          Start now
        </button>

        <p style={{ opacity: 0.5, fontSize: 12, marginTop: 10 }}>
          Launch faster than traditional development stacks
        </p>
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