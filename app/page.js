"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const trackCTA = async (eventName) => {
    try {
      await fetch("/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: eventName,
          page: "/",
          timestamp: Date.now(),
        }),
      });
    } catch (err) {
      console.error("Tracking failed:", err);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__tracked = false;
    }

    const onScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = window.scrollY / height;

      if (scrollProgress > 0.5 && !window.__tracked) {
        window.__tracked = true;
        trackCTA("scroll_50");
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main style={styles.page}>

      {/* NAVIGATION */}
      <nav style={styles.nav}>
        <div style={styles.logo}>RoofFlow</div>

        <div style={styles.navLinks}>
          <Link href="/" style={styles.link}>Home</Link>
          <Link href="/pricing" style={styles.link}>Pricing</Link>
          <Link href="/apply" style={styles.link}>Apply</Link>
          <Link href="/leads" style={styles.link}>Dashboard</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.badge}>RoofFlow — Roofing Lead Booking System</div>

        <h1 style={styles.h1}>
          Book Roofing Jobs<br />Directly Into Your Calendar
        </h1>

        <p style={styles.p}>
          Stop paying for shared leads and wasted ads.
          <br /><br />
          RoofFlow delivers <b>exclusive, pre-qualified roofing appointments</b> directly to contractors.
        </p>

        <div style={styles.ctaRow}>
          <Link
            href="/apply"
            onClick={() => trackCTA("apply_click")}
            style={styles.primaryBtn}
          >
            Apply For Territory
          </Link>

          <Link
            href="/pricing"
            onClick={() => trackCTA("pricing_click")}
            style={styles.secondaryBtn}
          >
            View Pricing
          </Link>
        </div>

        <p style={styles.small}>
          Limited contractors per city to protect lead quality.
        </p>
      </section>

      {/* SECTION 1 */}
      <section style={styles.card}>
        <h2>Who This Is For</h2>
        <ul>
          <li>Roofing companies already doing consistent installs</li>
          <li>Contractors spending money on ads or lead platforms</li>
          <li>Teams wanting predictable booked jobs</li>
        </ul>
      </section>

      {/* SECTION 2 */}
      <section style={styles.card}>
        <h2>How RoofFlow Works</h2>
        <ul>
          <li>We filter homeowner intent before you see them</li>
          <li>We qualify roofing urgency automatically</li>
          <li>We book confirmed appointments into your pipeline</li>
        </ul>
      </section>

      {/* SECTION 3 */}
      <section style={styles.cardHighlight}>
        <h2>Why Contractors Switch</h2>
        <p>
          No more shared leads. No more cold calls. No more wasted ad spend.
        </p>
        <p>
          Just real homeowners requesting roofing estimates.
        </p>
      </section>

      {/* FINAL CTA */}
      <section style={styles.finalCta}>
        <h2>Ready to Claim Your Territory?</h2>

        <Link
          href="/apply"
          onClick={() => trackCTA("final_apply_click")}
          style={styles.primaryBtn}
        >
          Get Started
        </Link>
      </section>

    </main>
  );
}