"use client";

import { useState, useMemo } from "react";

export default function Apply() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState("growth");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSubmit, setLastSubmit] = useState(0);
  const [website, setWebsite] = useState(""); // honeypot

  const isValidEmail = (v) => /\S+@\S+\.\S+/.test(v);

  const disposableDomains = new Set([
    "mailinator.com",
    "tempmail.com",
    "10minutemail.com",
    "guerrillamail.com",
    "yopmail.com",
    "trashmail.com",
  ]);

  const isDisposableEmail = (email) => {
    const domain = email.split("@")[1];
    return disposableDomains.has(domain);
  };

  const normalizePhone = (v) => v.replace(/\D/g, "");

  const formatPhone = (value) => {
    const digits = normalizePhone(value).slice(0, 10);

    if (digits.length <= 3) return digits;
    if (digits.length <= 6)
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;

    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const cleanedPhone = useMemo(() => normalizePhone(phone), [phone]);
  const isValidPhone = cleanedPhone.length === 10;

  const leadScore = useMemo(() => {
    let score = 0;

    if (isValidEmail(email)) score += 40;
    if (isValidPhone) score += 40;
    if (!email.includes("gmail")) score += 10;
    if (email.startsWith("info@") || email.startsWith("admin@")) score += 10;

    return Math.min(score, 100);
  }, [email, isValidPhone]);

  const isQualified = leadScore >= 80;

  const handleNext = () => {
    setError("");

    if (!isValidEmail(email)) {
      return setError("Enter a valid business email.");
    }

    if (isDisposableEmail(email)) {
      return setError("Disposable emails are not accepted.");
    }

    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (website) return setError("Bot detected.");

    const now = Date.now();
    if (now - lastSubmit < 10000) {
      return setError("Please wait before submitting again.");
    }
    setLastSubmit(now);

    if (!isValidPhone) {
      return setError("Enter a valid phone number.");
    }

    if (!isQualified) {
      return setError("Application not approved for your region.");
    }

    setLoading(true);

    try {
      const payload = {
        email,
        phone: cleanedPhone,
        plan,
        lead_score: leadScore,
        source: "apply_form",
      };

      await fetch("/api/leads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Checkout failed");

      if (data?.url) window.location.href = data.url;

    } catch (err) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Honeypot */}
        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          style={{ display: "none" }}
          tabIndex="-1"
        />

        {/* HEADER */}
        <h1 style={styles.h1}>
          Apply for Exclusive Roofing Leads in Your Territory
        </h1>

        <p style={styles.subtext}>
          We only accept a limited number of contractors per region to maintain lead quality and exclusivity.
        </p>

        {/* STATUS */}
        <p style={{
          fontSize: 13,
          fontWeight: "bold",
          color: isQualified ? "#22c55e" : "#f87171",
        }}>
          {isQualified
            ? "✅ Pre-Qualified — Priority Access Available"
            : "⚠️ Qualification Required"}
        </p>

        <p style={styles.step}>Step {step} of 2</p>

        {/* TRUST */}
        <p style={styles.badges}>
          🔒 Secure · 🛡️ Spam Protected · ⚡ Instant Approval · 🌎 Limited Territories
        </p>

        {/* PLAN */}
        <div style={styles.planBox}>
          <p style={styles.labelSmall}>Select Access Level</p>

          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            style={styles.select}
          >
            <option value="starter">Starter — 5–10 Leads ($499/mo)</option>
            <option value="growth">Growth — 15–30 Leads ($999/mo)</option>
            <option value="domination">Domination — Exclusive Territory ($1,999/mo)</option>
          </select>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>

          {step === 1 && (
            <>
              <label style={styles.label}>Business Email</label>

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                style={styles.input}
              />

              <button type="button" onClick={handleNext} style={styles.button}>
                Check Availability
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <label style={styles.label}>Phone Number</label>

              <input
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(780) 123-4567"
                style={styles.input}
              />

              <button type="submit" style={styles.button} disabled={loading}>
                {loading ? "Securing Spot..." : "Secure My Territory"}
              </button>
            </>
          )}

          {error && <p style={styles.error}>{error}</p>}

        </form>
      </div>
    </div>
  );
}
