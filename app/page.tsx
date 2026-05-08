"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    fetch("https://your-backend.onrender.com/health")
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() => setStatus({ success: false }));
  }, []);

  return (
    <main style={styles.page}>
      
      {/* NAVBAR */}
      <header style={styles.nav}>
        <div style={styles.logo}>Flow OS</div>

        <div style={styles.navRight}>
          <a style={styles.link} href="#features">Features</a>
          <a style={styles.link} href="#status">Status</a>
          <a style={styles.buttonSmall} href="/dashboard">Dashboard</a>
        </div>
      </header>

      {/* HERO */}
      <section style={styles.hero}>
        <h1 style={styles.title}>
          The AI Backend Infrastructure for Modern Apps
        </h1>

        <p style={styles.subtitle}>
          Build faster with scalable APIs, authentication, and real-time system health — powered by Flow OS.
        </p>

        <div style={styles.ctaRow}>
          <a style={styles.primaryButton} href="/dashboard">
            Launch Dashboard
          </a>
          <a style={styles.secondaryButton} href="#features">
            Explore Features
          </a>
        </div>
      </section>

      {/* STATUS CARD */}
      <section id="status" style={styles.statusSection}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>System Status</h2>

          {!status ? (
            <p style={styles.muted}>Checking backend...</p>
          ) : status.success ? (
            <>
              <p style={styles.successText}>✅ {status.message}</p>
              <p style={styles.muted}>Status: {status.status}</p>
            </>
          ) : (
            <p style={styles.errorText}>❌ Backend offline</p>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={styles.features}>
        <div style={styles.featureCard}>
          <h3>⚡ Fast API Layer</h3>
          <p>Built for scalable Node + Express backend deployments on Render.</p>
        </div>

        <div style={styles.featureCard}>
          <h3>🔐 Secure Architecture</h3>
          <p>Environment-based config with production-ready security patterns.</p>
        </div>

        <div style={styles.featureCard}>
          <h3>📡 Live System Health</h3>
          <p>Real-time backend monitoring directly from your homepage.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p>Flow OS • Built for scalable backend systems</p>
      </footer>
    </main>
  );
}

/* =========================
   STYLES
========================= */

const styles: any = {
  page: {
    fontFamily: "Arial, sans-serif",
    background: "#0b0f17",
    color: "#fff",
    minHeight: "100vh",
  },

  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "20px 40px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  logo: {
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 1,
  },

  navRight: {
    display: "flex",
    gap: 20,
    alignItems: "center",
  },

  link: {
    color: "#aaa",
    textDecoration: "none",
  },

  buttonSmall: {
    padding: "8px 14px",
    background: "#2563eb",
    borderRadius: 8,
    color: "#fff",
    textDecoration: "none",
  },

  hero: {
    textAlign: "center",
    padding: "100px 20px 60px",
  },

  title: {
    fontSize: 44,
    fontWeight: 700,
    maxWidth: 800,
    margin: "0 auto",
  },

  subtitle: {
    marginTop: 20,
    fontSize: 18,
    color: "#aaa",
    maxWidth: 600,
    marginLeft: "auto",
    marginRight: "auto",
  },

  ctaRow: {
    marginTop: 30,
    display: "flex",
    gap: 15,
    justifyContent: "center",
  },

  primaryButton: {
    background: "#2563eb",
    padding: "12px 20px",
    borderRadius: 10,
    color: "#fff",
    textDecoration: "none",
  },

  secondaryButton: {
    border: "1px solid #333",
    padding: "12px 20px",
    borderRadius: 10,
    color: "#fff",
    textDecoration: "none",
  },

  statusSection: {
    display: "flex",
    justifyContent: "center",
    padding: "40px 20px",
  },

  card: {
    background: "#111827",
    padding: 30,
    borderRadius: 14,
    width: "100%",
    maxWidth: 500,
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  cardTitle: {
    marginBottom: 10,
  },

  successText: {
    color: "#22c55e",
  },

  errorText: {
    color: "#ef4444",
  },

  muted: {
    color: "#aaa",
  },

  features: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
    padding: "60px 40px",
  },

  featureCard: {
    background: "#111827",
    padding: 20,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
  },

  footer: {
    textAlign: "center",
    padding: 40,
    color: "#666",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
};