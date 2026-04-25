"use client";

import { useState, useMemo } from "react";

export default function Apply() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState("growth");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔒 Validation helpers
  const isValidEmail = (v) => /\S+@\S+\.\S+/.test(v);

  const normalizePhone = (v) => v.replace(/\D/g, "");

  const isValidPhone = (v) => {
    const cleaned = normalizePhone(v);
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  const resetError = () => setError("");

  // 🧠 Lead score (UI hint only — backend must validate again)
  const leadScore = useMemo(() => {
    return (isValidEmail(email) ? 50 : 0) +
           (isValidPhone(phone) ? 50 : 0);
  }, [email, phone]);

  // 👉 Step 1 validation
  const handleNext = () => {
    resetError();

    if (!isValidEmail(email)) {
      setError("Please enter a valid business email.");
      return;
    }

    setStep(2);
  };

  // 🚀 Checkout handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    resetError();

    if (!isValidPhone(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (leadScore < 80) {
      setError("We only accept qualified roofing contractors.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone,
          plan,
          leadScore,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Checkout failed");
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.h1}>Apply to RoofFlow</h1>

        <p style={styles.subtext}>
          Automated roofing appointments delivered directly to your pipeline
        </p>

        <p style={styles.step}>Step {step} of 2</p>

        <p style={styles.badges}>
          🔒 Secure · ⚡ Instant qualification · 🏠 Exclusive territories
        </p>

        {/* PLAN SELECT */}
        <div style={styles.planBox}>
          <p style={styles.labelSmall}>Select Plan</p>

          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            style={styles.select}
          >
            <option value="starter">Starter — $499/mo</option>
            <option value="growth">Growth — $999/mo</option>
            <option value="domination">Domination — $1,999/mo</option>
          </select>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* STEP 1 */}
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
                Continue
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <label style={styles.label}>Phone Number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 555-5555"
                style={styles.input}
              />

              <button type="submit" style={styles.button} disabled={loading}>
                {loading ? "Redirecting..." : "Continue to Payment"}
              </button>
            </>
          )}

          {error && <p style={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
