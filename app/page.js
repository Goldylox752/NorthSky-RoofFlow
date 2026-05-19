"use client";

import { useEffect, useState, useRef } from "react";

/* ─── DATA ──────────────────────────────────────────────── */
const FEED_ITEMS = [
  { city: "Austin, TX", type: "Storm Damage", score: 96, urgency: "CRITICAL", icon: "⚡" },
  { city: "Denver, CO", type: "Full Replacement", score: 89, urgency: "HIGH", icon: "🏠" },
  { city: "Calgary, AB", type: "Insurance Claim", score: 92, urgency: "CRITICAL", icon: "📋" },
  { city: "Phoenix, AZ", type: "Emergency Repair", score: 84, urgency: "HIGH", icon: "🔧" },
  { city: "Nashville, TN", type: "Hail Damage", score: 91, urgency: "CRITICAL", icon: "⛈️" },
  { city: "Dallas, TX", type: "New Construction", score: 78, urgency: "MEDIUM", icon: "🏗️" },
  { city: "Charlotte, NC", type: "Commercial Job", score: 88, urgency: "HIGH", icon: "🏢" },
  { city: "Tampa, FL", type: "Wind Damage", score: 95, urgency: "CRITICAL", icon: "🌀" },
];

const FEATURES = [
  {
    icon: "◈",
    title: "Storm Intelligence",
    desc: "Real-time weather correlation maps inbound demand before your competitors know a storm hit. Hail paths, wind zones, and damage probability scored per ZIP.",
    stat: "8min avg alert",
  },
  {
    icon: "◉",
    title: "AI Lead Scoring",
    desc: "40+ signals — roof age, home equity, permit history, storm proximity — distilled into a single score. Work the 90s first, let the 60s sit.",
    stat: "94% accuracy",
  },
  {
    icon: "◐",
    title: "Territory Control",
    desc: "Visualize demand density across your markets. Lock down zip codes, set capacity limits, and stop your team from chasing leads outside your sweet spot.",
    stat: "3–50 markets",
  },
  {
    icon: "◑",
    title: "Instant CRM Push",
    desc: "Qualified leads land in JobNimbus, HubSpot, or Salesforce the moment they score above your threshold. Zero manual entry. Zero dropped balls.",
    stat: "< 30s sync",
  },
  {
    icon: "◧",
    title: "SMS War Room",
    desc: "Your field team gets a text the second a high-score lead hits their territory. First call wins the job. Every time.",
    stat: "< 5s delivery",
  },
  {
    icon: "◨",
    title: "Conversion Analytics",
    desc: "Track every lead from first signal to signed contract. See where you're losing jobs, which reps close, and where your territory bleeds money.",
    stat: "Full funnel",
  },
];

const RESULTS = [
  { num: "3.2×", label: "Faster response than competitors" },
  { num: "68%", label: "Of teams close more in month one" },
  { num: "$2.4M", label: "Avg annual pipeline per team" },
  { num: "47", label: "Markets live and scaling" },
];

const TESTIMONIALS = [
  {
    quote: "We're on-site before our competitors even hear about the storm. RoofFlow's alert system is the single biggest edge we have in this market.",
    name: "Jason M.",
    role: "Owner",
    company: "Peak Roofing — Denver, CO",
    score: "↑ 61% close rate",
  },
  {
    quote: "Lead quality changed overnight. We stopped chasing dead-end appointments and our conversion rate hit an all-time high within 6 weeks.",
    name: "Rachel T.",
    role: "Sales Director",
    company: "Skyline Contractors — Phoenix, AZ",
    score: "↑ 44% revenue",
  },
  {
    quote: "The territory mapping alone is worth it. We found $800k in demand sitting in zip codes we weren't even working. That was month one.",
    name: "Marcus C.",
    role: "CEO",
    company: "Ridge Masters — Austin, TX",
    score: "$800k new pipeline",
  },
  {
    quote: "RoofFlow paid for itself in 11 days. I'm not exaggerating. The storm alert fired, we called first, we closed. Done.",
    name: "Derek K.",
    role: "VP Operations",
    company: "Summit Roofing Group — Nashville, TN",
    score: "ROI in 11 days",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "297",
    period: "/mo",
    features: ["1 territory", "100 leads/month", "Basic scoring", "Email alerts", "—", "—"],
    cta: "Get Started",
    featured: false,
    priceId: "price_starter",
  },
  {
    name: "Pro",
    price: "697",
    period: "/mo",
    features: ["3 territories", "Unlimited leads", "AI scoring (40+ signals)", "SMS + Slack alerts", "CRM integrations", "Storm intelligence"],
    cta: "Start Free Trial",
    featured: true,
    priceId: "price_pro",
  },
  {
    name: "Enterprise",
    price: null,
    period: "",
    features: ["Unlimited territories", "Unlimited leads", "Custom AI models", "Dedicated manager", "White-label", "SLA + priority support"],
    cta: "Talk to Sales",
    featured: false,
    priceId: null,
  },
];

/* ─── HOOKS ──────────────────────────────────────────────── */
function useCountUp(target, duration = 1600, suffix = "") {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          setVal(Math.floor(p * target));
          if (p < 1) requestAnimationFrame(tick);
          else setVal(target);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { ref, display: val + suffix };
}

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.08 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── SUBCOMPONENTS ──────────────────────────────────────── */
function LiveFeed() {
  const [items, setItems] = useState(FEED_ITEMS.slice(0, 5));
  const [incoming, setIncoming] = useState(null);
  const idx = useRef(5);

  useEffect(() => {
    const id = setInterval(() => {
      const next = FEED_ITEMS[idx.current % FEED_ITEMS.length];
      idx.current++;
      setIncoming(next);
      setTimeout(() => {
        setItems(prev => [next, ...prev].slice(0, 5));
        setIncoming(null);
      }, 500);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const urgencyColor = (u) =>
    u === "CRITICAL" ? "#ff4444" : u === "HIGH" ? "#f59e0b" : "#22c55e";

  return (
    <div style={{
      background: "#0a1a0a",
      border: "1px solid #1a3a1a",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 0 60px rgba(34,197,94,0.06)",
    }}>
      {/* Header */}
      <div style={{
        background: "#071007",
        borderBottom: "1px solid #1a3a1a",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {["#ff5f57","#febc2e","#28c840"].map(c => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#4a7a4a", marginLeft: 8 }}>
            roofflow.pipeline
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#22c55e", fontWeight: 700 }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: "#22c55e",
            display: "inline-block",
            animation: "pulse-green 1.5s ease infinite",
          }} />
          LIVE
        </div>
      </div>

      {/* Metrics row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid #1a3a1a" }}>
        {[["24", "Leads Today"], ["91%", "Avg Score"], ["$186k", "Pipeline"]].map(([v, l]) => (
          <div key={l} style={{
            padding: "16px 20px",
            borderRight: "1px solid #1a3a1a",
            "&:last-child": { borderRight: "none" },
          }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 700, color: "#22c55e", lineHeight: 1 }}>{v}</div>
            <div style={{ fontSize: 10, color: "#4a7a4a", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Feed */}
      <div style={{ padding: "16px 16px 20px" }}>
        <div style={{ fontSize: 10, color: "#4a7a4a", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>
          ● LIVE DEMAND FEED
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {incoming && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px",
              background: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: 8,
              animation: "slideDown 0.4s ease",
            }}>
              <span style={{ fontSize: 16 }}>{incoming.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#e8ffe8" }}>{incoming.type}</div>
                <div style={{ fontSize: 11, color: "#4a7a4a" }}>{incoming.city}</div>
              </div>
              <div style={{
                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                background: "rgba(255,68,68,0.12)", color: urgencyColor(incoming.urgency),
              }}>{incoming.urgency}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#22c55e", fontWeight: 700 }}>{incoming.score}</div>
            </div>
          )}
          {items.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px",
              background: "#071007",
              border: "1px solid #1a3a1a",
              borderRadius: 8,
              opacity: 1 - i * 0.12,
            }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#c8e8c8" }}>{item.type}</div>
                <div style={{ fontSize: 11, color: "#4a7a4a" }}>{item.city}</div>
              </div>
              <div style={{
                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                background: `${urgencyColor(item.urgency)}18`, color: urgencyColor(item.urgency),
              }}>{item.urgency}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#22c55e", fontWeight: 700 }}>{item.score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DemoModal({ open, onClose }) {
  const [state, setState] = useState("idle"); // idle | loading | success
  const [form, setForm] = useState({ name: "", email: "", company: "" });

  const submit = async () => {
    if (!form.name || !form.email || !form.company) return;
    setState("loading");
    try {
      const res = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setState("success");
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "demo_requested", ...form }),
        }).catch(() => {});
      } else setState("idle");
    } catch { setState("idle"); }
  };

  if (!open) return null;

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(8px)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#071007", border: "1px solid #2a5a2a",
        borderRadius: 20, padding: 48, width: "100%", maxWidth: 460,
        position: "relative", boxShadow: "0 0 80px rgba(34,197,94,0.08)",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 18, right: 18,
          background: "none", border: "none", color: "#4a7a4a",
          fontSize: 20, cursor: "pointer", lineHeight: 1,
        }}>✕</button>

        {state !== "success" ? (
          <>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 38, fontWeight: 700, letterSpacing: 2, marginBottom: 6, color: "#e8ffe8" }}>
              REQUEST DEMO
            </div>
            <p style={{ fontSize: 13, color: "#4a7a4a", marginBottom: 28 }}>
              We'll reach out within 1 business day.
            </p>
            {["name", "email", "company"].map(f => (
              <div key={f} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#4a7a4a", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 8 }}>
                  {f === "name" ? "Full Name" : f === "email" ? "Work Email" : "Company"}
                </label>
                <input
                  type={f === "email" ? "email" : "text"}
                  value={form[f]}
                  onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                  placeholder={f === "name" ? "Jason Miller" : f === "email" ? "jason@peakroofing.com" : "Peak Roofing Co."}
                  style={{
                    width: "100%", background: "#0a1a0a", border: "1px solid #1a3a1a",
                    borderRadius: 8, padding: "12px 16px", fontSize: 14, color: "#e8ffe8",
                    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
                  }}
                  onFocus={e => e.target.style.borderColor = "#22c55e"}
                  onBlur={e => e.target.style.borderColor = "#1a3a1a"}
                />
              </div>
            ))}
            <button
              onClick={submit}
              disabled={state === "loading"}
              style={{
                width: "100%", background: "#22c55e", color: "#020d02",
                border: "none", borderRadius: 8, padding: "15px",
                fontWeight: 700, fontSize: 15, cursor: "pointer",
                marginTop: 8, fontFamily: "inherit",
                opacity: state === "loading" ? 0.7 : 1,
                transition: "all 0.2s",
              }}
            >
              {state === "loading" ? "Submitting..." : "⚡ Submit Request"}
            </button>
            <p style={{ fontSize: 11, color: "#2a4a2a", textAlign: "center", marginTop: 12 }}>
              No spam. No pressure. Just a real conversation.
            </p>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 700, letterSpacing: 2, color: "#22c55e" }}>YOU'RE IN</div>
            <p style={{ color: "#4a7a4a", marginTop: 10, fontSize: 14 }}>We'll be in touch within 1 business day.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ──────────────────────────────────────────── */
export default function Page() {
  const [modalOpen, setModalOpen] = useState(false);
  const heroReveal = useReveal();
  const featReveal = useReveal();
  const statsReveal = useReveal();
  const testiReveal = useReveal();
  const pricingReveal = useReveal();

  const leadsCount = useCountUp(24, 1200);
  const closeCount = useCountUp(68, 1400, "%");
  const pipeCount = useCountUp(24, 1600, "k");
  const mktCount = useCountUp(47, 1800);

  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "page_view", page: "roofflow_landing" }),
    }).catch(() => {});
  }, []);

  const startCheckout = async (priceId) => {
    if (!priceId) { setModalOpen(true); return; }
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch { alert("Unable to start checkout. Please try again."); }
  };

  const section = (children, style = {}) => (
    <section style={{ position: "relative", zIndex: 1, ...style }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "96px 32px" }}>
        {children}
      </div>
    </section>
  );

  const label = (text) => (
    <div style={{
      fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
      color: "#22c55e", letterSpacing: "2px", textTransform: "uppercase",
      marginBottom: 12, display: "flex", alignItems: "center", gap: 8,
    }}>
      <span>●</span> {text}
    </div>
  );

  const heading = (text, style = {}) => (
    <h2 style={{
      fontFamily: "'Barlow Condensed', sans-serif",
      fontSize: "clamp(42px, 5vw, 68px)",
      fontWeight: 700, lineHeight: 0.95,
      letterSpacing: "2px", color: "#e8ffe8",
      ...style,
    }}>{text}</h2>
  );

  return (
    <>
      {/* GLOBAL STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=DM+Mono:wght@400;500&family=Lato:wght@300;400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #020d02; color: #c8e8c8; font-family: 'Lato', sans-serif; overflow-x: hidden; }
        input::placeholder { color: #2a4a2a; }
        input:focus { outline: none; }

        @keyframes pulse-green {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes scanline {
          0% { top: -2px; }
          100% { top: 100%; }
        }
        .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }

        .hero-anim { animation: fadeUp 0.7s ease both; }
        .hero-anim-2 { animation: fadeUp 0.7s 0.12s ease both; }
        .hero-anim-3 { animation: fadeUp 0.7s 0.24s ease both; }
        .hero-anim-4 { animation: fadeUp 0.7s 0.36s ease both; }

        .btn-primary {
          background: #22c55e; color: #020d02; border: none;
          padding: 16px 32px; border-radius: 6px;
          font-family: 'Lato', sans-serif; font-weight: 700; font-size: 15px;
          cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-primary:hover { background: #4ade80; transform: translateY(-2px); box-shadow: 0 12px 40px rgba(34,197,94,0.2); }

        .btn-ghost {
          background: transparent; color: #6a9a6a;
          border: 1px solid #1a3a1a; padding: 16px 28px; border-radius: 6px;
          font-family: 'Lato', sans-serif; font-weight: 500; font-size: 15px;
          cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-ghost:hover { border-color: #22c55e; color: #22c55e; }

        .feature-card {
          background: #071007; border: 1px solid #1a3a1a;
          border-radius: 12px; padding: 36px;
          transition: all 0.3s; position: relative; overflow: hidden;
        }
        .feature-card:hover { border-color: #2a5a2a; background: #0a1a0a; transform: translateY(-2px); }
        .feature-card::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #22c55e, transparent);
          transform: scaleX(0); transform-origin: left; transition: transform 0.3s;
        }
        .feature-card:hover::after { transform: scaleX(1); }

        .testi-card {
          background: #071007; border: 1px solid #1a3a1a;
          border-radius: 14px; padding: 32px; transition: border-color 0.3s;
        }
        .testi-card:hover { border-color: #2a5a2a; }

        .price-card {
          background: #071007; border: 1px solid #1a3a1a;
          border-radius: 16px; padding: 36px; transition: all 0.3s;
        }
        .price-card:hover { transform: translateY(-4px); border-color: #2a5a2a; }
        .price-card.featured {
          border-color: #22c55e;
          background: linear-gradient(180deg, rgba(34,197,94,0.04), #071007);
          box-shadow: 0 0 60px rgba(34,197,94,0.06);
        }

        .nav-link { color: #4a7a4a; font-size: 13px; font-weight: 500; text-decoration: none; transition: color 0.2s; letter-spacing: 0.5px; }
        .nav-link:hover { color: #22c55e; }

        .scan-line {
          position: absolute; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(34,197,94,0.3), transparent);
          animation: scanline 4s linear infinite;
          pointer-events: none;
        }
      `}</style>

      {/* BG GRID */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(34,197,94,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.025) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />
      {/* GLOW */}
      <div style={{
        position: "fixed", top: -200, left: -100, width: 600, height: 600,
        background: "radial-gradient(circle, rgba(34,197,94,0.04), transparent 70%)",
        borderRadius: "50%", pointerEvents: "none", zIndex: 0,
      }} />

      <DemoModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 66, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px",
        background: "rgba(2, 13, 2, 0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid #1a3a1a",
      }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 26, fontWeight: 800, letterSpacing: 4, color: "#e8ffe8",
        }}>
          ROOF<span style={{ color: "#22c55e" }}>FLOW</span>
        </div>
        <div style={{ display: "flex", gap: 36 }}>
          {["Features", "Workflow", "Results", "Pricing"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="nav-link">{l}</a>
          ))}
        </div>
        <button className="btn-primary" style={{ padding: "10px 22px", fontSize: 13 }} onClick={() => setModalOpen(true)}>
          Request Demo →
        </button>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", alignItems: "center", padding: "120px 32px 80px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", width: "100%" }}>

          <div>
            <div className="hero-anim" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)",
              padding: "6px 14px", borderRadius: 100, fontSize: 11, fontWeight: 700,
              color: "#22c55e", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 28,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse-green 1.5s ease infinite" }} />
              Live in 47 Markets
            </div>

            <h1 className="hero-anim-2" style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(62px, 7vw, 96px)",
              fontWeight: 800, lineHeight: 0.9,
              letterSpacing: "3px", color: "#e8ffe8",
            }}>
              ROOFING<br/>
              <span style={{ color: "#22c55e" }}>LEADS</span><br/>
              <span style={{
                WebkitTextStroke: "2px #e8ffe8", color: "transparent",
              }}>THAT CLOSE.</span>
            </h1>

            <p className="hero-anim-3" style={{
              fontSize: 17, lineHeight: 1.7, color: "#6a9a6a",
              maxWidth: 460, marginTop: 24,
            }}>
              RoofFlow gives roofing contractors real-time demand intelligence — storm alerts, AI scoring, and instant CRM sync. First call wins the job. Every time.
            </p>

            <div className="hero-anim-4" style={{ display: "flex", gap: 14, marginTop: 36 }}>
              <button className="btn-primary" onClick={() => setModalOpen(true)}>
                ⚡ Get Early Access
              </button>
              <button className="btn-ghost" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
                See How It Works →
              </button>
            </div>

            <div className="hero-anim-4" style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 40 }}>
              <div style={{ display: "flex" }}>
                {["JM","RT","DK","MC"].map((i, idx) => (
                  <div key={i} style={{
                    width: 32, height: 32, borderRadius: "50%",
                    border: "2px solid #020d02",
                    background: `linear-gradient(135deg, #0a2a0a, #1a4a1a)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: "#22c55e",
                    marginLeft: idx === 0 ? 0 : -10,
                  }}>{i}</div>
                ))}
              </div>
              <div>
                <div style={{ color: "#f59e0b", fontSize: 12, letterSpacing: "2px" }}>★★★★★</div>
                <div style={{ fontSize: 13, color: "#4a7a4a" }}>
                  Trusted by <strong style={{ color: "#c8e8c8" }}>200+ roofing teams</strong>
                </div>
              </div>
            </div>
          </div>

          <div style={{ animation: "fadeUp 0.9s 0.2s ease both" }}>
            <LiveFeed />
          </div>
        </div>
      </section>

      {/* ── LOGOS ── */}
      <div style={{ borderTop: "1px solid #1a3a1a", borderBottom: "1px solid #1a3a1a", padding: "24px 0", overflow: "hidden", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", gap: 64, animation: "marquee 22s linear infinite", width: "max-content" }}>
          {[...Array(2)].map((_, d) =>
            ["STORM GUARD","PEAK ROOFING","SKYLINE PRO","RIDGE MASTERS","APEX CONTRACTING","SUMMIT ROOFING","CLEARWATER PROS"].map(n => (
              <span key={`${d}-${n}`} style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 16, letterSpacing: "3px", color: "rgba(34,197,94,0.18)",
                whiteSpace: "nowrap", fontWeight: 700,
              }}>{n}</span>
            ))
          )}
        </div>
      </div>

      {/* ── FEATURES ── */}
      {section(
        <div ref={featReveal.ref} className={`reveal ${featReveal.visible ? "visible" : ""}`} id="features">
          {label("// Platform Features")}
          {heading("EVERYTHING YOUR\nPIPELINE NEEDS")}
          <p style={{ fontSize: 15, color: "#4a7a4a", marginTop: 14, maxWidth: 420, lineHeight: 1.7 }}>
            Built specifically for roofing contractors who want to dominate their market.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 52 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.08}s` }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 32, color: "#22c55e", marginBottom: 16, lineHeight: 1,
                }}>{f.icon}</div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 22, fontWeight: 700, letterSpacing: 1, marginBottom: 10, color: "#e8ffe8",
                }}>{f.title}</div>
                <p style={{ fontSize: 13, color: "#4a7a4a", lineHeight: 1.7, marginBottom: 20 }}>{f.desc}</p>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11, color: "#22c55e", fontWeight: 500,
                  background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)",
                  padding: "4px 10px", borderRadius: 4, display: "inline-block",
                }}>{f.stat}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── WORKFLOW ── */}
      {section(
        <div id="workflow" style={{ textAlign: "center" }}>
          {label("// How It Works")}
          {heading("LEAD → JOB\nIN MINUTES", { textAlign: "center" })}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", gap: 0, marginTop: 64, alignItems: "center" }}>
            {[
              { n: "01", title: "Capture", desc: "Storm data, permit filings, and homeowner signals hit your dashboard the moment they appear.", icon: "◈" },
              { n: "02", title: "Score & Qualify", desc: "AI ranks every lead by urgency, roof age, damage type, and location fit. Work the 90s first.", icon: "◉" },
              { n: "03", title: "Close", desc: "Qualified leads push to your CRM and your team gets an SMS. First call wins the job.", icon: "◐" },
            ].map((s, i) => (
              <>
                <div key={s.n} style={{
                  background: "#071007", border: "1px solid #1a3a1a",
                  borderRadius: 16, padding: "48px 36px", textAlign: "center", position: "relative",
                }}>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 72, color: "rgba(34,197,94,0.06)",
                    position: "absolute", top: 12, right: 20, lineHeight: 1, fontWeight: 800,
                  }}>{s.n}</div>
                  <div style={{ fontSize: 28, color: "#22c55e", marginBottom: 20 }}>{s.icon}</div>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 26, fontWeight: 700, letterSpacing: 1, marginBottom: 12, color: "#e8ffe8",
                  }}>{s.title}</div>
                  <p style={{ fontSize: 13, color: "#4a7a4a", lineHeight: 1.7 }}>{s.desc}</p>
                </div>
                {i < 2 && (
                  <div key={`arrow-${i}`} style={{ textAlign: "center", color: "#22c55e", fontSize: 24, padding: "0 16px", opacity: 0.5 }}>→</div>
                )}
              </>
            ))}
          </div>
        </div>,
        { background: "rgba(255,255,255,0.01)", borderTop: "1px solid #1a3a1a", borderBottom: "1px solid #1a3a1a" }
      )}

      {/* ── STATS ── */}
      {section(
        <div ref={statsReveal.ref} className={`reveal ${statsReveal.visible ? "visible" : ""}`} id="results">
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            {label("// By The Numbers")}
            {heading("RESULTS THAT\nSPEAK FOR THEMSELVES", { textAlign: "center" })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: "1px solid #1a3a1a", borderRadius: 16, overflow: "hidden" }}>
            {[
              { ref: statsReveal.ref, num: "3.2×", label: "Faster response than competitors" },
              { ref: null, num: "68%", label: "Close more jobs in month one" },
              { ref: null, num: "$2.4M", label: "Avg pipeline per team per year" },
              { ref: null, num: "47", label: "Active markets and scaling" },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "52px 36px", background: "#071007", textAlign: "center",
                borderRight: i < 3 ? "1px solid #1a3a1a" : "none",
              }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 56, fontWeight: 700, color: "#22c55e", lineHeight: 1, letterSpacing: 2,
                }}>{s.num}</div>
                <div style={{ fontSize: 13, color: "#4a7a4a", marginTop: 10, lineHeight: 1.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TESTIMONIALS ── */}
      {section(
        <div ref={testiReveal.ref} className={`reveal ${testiReveal.visible ? "visible" : ""}`}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            {label("// Client Stories")}
            {heading("TEAMS WINNING\nWITH ROOFFLOW", { textAlign: "center" })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testi-card">
                <div style={{ color: "#f59e0b", fontSize: 13, letterSpacing: "2px", marginBottom: 16 }}>★★★★★</div>
                <p style={{ fontSize: 15, lineHeight: 1.75, color: "#c8e8c8", fontStyle: "italic" }}>"{t.quote}"</p>
                <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 14, fontWeight: 700, color: "#22c55e",
                    }}>{t.name.split(" ").map(n => n[0]).join("")}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#e8ffe8" }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: "#4a7a4a" }}>{t.role} — {t.company}</div>
                    </div>
                  </div>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11, color: "#22c55e", fontWeight: 500,
                    background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)",
                    padding: "4px 10px", borderRadius: 4, whiteSpace: "nowrap",
                  }}>{t.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>,
        { background: "rgba(255,255,255,0.01)", borderTop: "1px solid #1a3a1a", borderBottom: "1px solid #1a3a1a" }
      )}

      {/* ── PRICING ── */}
      {section(
        <div ref={pricingReveal.ref} className={`reveal ${pricingReveal.visible ? "visible" : ""}`} id="pricing">
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            {label("// Pricing")}
            {heading("SIMPLE.\nTRANSPARENT. FAIR.", { textAlign: "center" })}
            <p style={{ fontSize: 14, color: "#4a7a4a", marginTop: 14 }}>No setup fees. No long-term contracts. Cancel anytime.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, alignItems: "start" }}>
            {PLANS.map((plan, i) => (
              <div key={i} className={`price-card ${plan.featured ? "featured" : ""}`} style={{ position: "relative" }}>
                {plan.featured && (
                  <div style={{
                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                    background: "#22c55e", color: "#020d02", fontSize: 11, fontWeight: 700,
                    padding: "4px 14px", borderRadius: 100, letterSpacing: "1px", textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}>Most Popular</div>
                )}
                <div style={{ fontSize: 11, color: "#4a7a4a", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>{plan.name}</div>
                {plan.price ? (
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 52, fontWeight: 700, color: "#e8ffe8", lineHeight: 1, letterSpacing: 2 }}>
                    <sup style={{ fontSize: 22, verticalAlign: "top", marginTop: 8 }}>$</sup>{plan.price}
                  </div>
                ) : (
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 38, fontWeight: 700, color: "#e8ffe8", lineHeight: 1, letterSpacing: 2, paddingTop: 8 }}>Custom</div>
                )}
                <div style={{ fontSize: 12, color: "#4a7a4a", marginTop: 4, marginBottom: 24 }}>
                  {plan.price ? "per month, billed monthly" : "volume pricing available"}
                </div>
                <div style={{ borderTop: "1px solid #1a3a1a", paddingTop: 24, marginBottom: 28 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      fontSize: 13, marginBottom: 12,
                      color: f === "—" ? "#2a4a2a" : "#6a9a6a",
                    }}>
                      <span style={{ color: f === "—" ? "#2a4a2a" : "#22c55e", width: 14, flexShrink: 0 }}>
                        {f === "—" ? "—" : "✓"}
                      </span>
                      {f === "—" ? "Not included" : f}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => plan.priceId ? startCheckout(plan.priceId) : setModalOpen(true)}
                  style={{
                    width: "100%", padding: "14px", borderRadius: 8,
                    fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 14,
                    cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.3px",
                    background: plan.featured ? "#22c55e" : "transparent",
                    color: plan.featured ? "#020d02" : "#6a9a6a",
                    border: plan.featured ? "none" : "1px solid #1a3a1a",
                  }}
                  onMouseOver={e => { if (!plan.featured) { e.target.style.borderColor = "#22c55e"; e.target.style.color = "#22c55e"; } }}
                  onMouseOut={e => { if (!plan.featured) { e.target.style.borderColor = "#1a3a1a"; e.target.style.color = "#6a9a6a"; } }}
                >
                  {plan.cta} →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FINAL CTA ── */}
      <div style={{ margin: "0 32px 80px", position: "relative", zIndex: 1 }}>
        <div style={{
          background: "#071007", border: "1px solid #2a5a2a",
          borderRadius: 24, padding: "80px 60px", textAlign: "center",
          position: "relative", overflow: "hidden",
        }}>
          <div className="scan-line" />
          <div style={{
            position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)",
            width: 600, height: 600,
            background: "radial-gradient(circle, rgba(34,197,94,0.05), transparent 70%)",
            pointerEvents: "none",
          }} />
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(46px, 5vw, 76px)",
            fontWeight: 800, letterSpacing: "3px", lineHeight: 0.95,
            color: "#e8ffe8", position: "relative",
          }}>
            YOUR PIPELINE.<br />
            <span style={{ color: "#22c55e" }}>FULLY LOADED.</span>
          </h2>
          <p style={{ fontSize: 16, color: "#4a7a4a", marginTop: 16, position: "relative" }}>
            Join 200+ roofing teams already closing more with RoofFlow.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 36, position: "relative" }}>
            <button className="btn-primary" style={{ fontSize: 16, padding: "18px 36px" }} onClick={() => setModalOpen(true)}>
              ⚡ Request Demo
            </button>
            <button className="btn-ghost" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>
              View Pricing →
            </button>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid #1a3a1a", padding: "36px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1,
      }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 20, letterSpacing: 4, color: "#4a7a4a", fontWeight: 700,
        }}>ROOF<span style={{ color: "#22c55e" }}>FLOW</span></div>
        <div style={{ fontSize: 12, color: "#2a4a2a" }}>© 2026 RoofFlow. All rights reserved.</div>
      </footer>
    </>
  );
}
