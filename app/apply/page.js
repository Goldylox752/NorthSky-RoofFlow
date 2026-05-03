"use client";

import { useState, useMemo, useRef } from "react";

export default function Apply() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState("growth");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [honeypot, setHoneypot] = useState("");
  const lastSubmitRef = useRef(0);

  // =========================
  // CONFIG
  // =========================
  const disposableDomains = useMemo(
    () =>
      new Set([
        "mailinator.com",
        "tempmail.com",
        "10minutemail.com",
        "guerrillamail.com",
        "yopmail.com",
        "trashmail.com",
      ]),
    []
  );

  const trustedDomains = useMemo(
    () => new Set(["gmail.com", "yahoo.com", "hotmail.com"]),
    []
  );

  // =========================
  // HELPERS
  // =========================
  const isValidEmail = (v) => /\S+@\S+\.\S+/.test(v);

  const getEmailDomain = (email) => email?.split("@")[1] || "";

  const isDisposableEmail = (email) =>
    disposableDomains.has(getEmailDomain(email));

  const normalizePhone = (v) => v.replace(/\D/g, "").slice(0, 10);

  const isValidPhone = (phone) => normalizePhone(phone).length === 10;

  const formatPhone = (value) => {
    const digits = normalizePhone(value);

    if (digits.length <= 3) return digits;
    if (digits.length <= 6)
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;

    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const cleanedPhone = useMemo(() => normalizePhone(phone), [phone]);

  // =========================
  // LEAD SCORE (soft signal only)
  // =========================
  const leadScore = useMemo(() => {
    let score = 0;

    if (isValidEmail(email)) score += 40;
    if (isValidPhone(phone)) score += 40;

    const domain = getEmailDomain(email);

    if (!trustedDomains.has(domain)) score += 10;
    if (email.startsWith("info@") || email.startsWith("sales@")) score += 10;

    return Math.min(score, 100);
  }, [email, phone, trustedDomains]);

  const isHighIntent = leadScore >= 80;

  // =========================
  // STEP 1
  // =========================
  const handleNext = () => {
    setError("");

    if (!isValidEmail(email)) {
      return setError("Enter a valid business email.");
    }

    if (isDisposableEmail(email)) {
      return setError("Temporary emails are not allowed.");
    }

    setStep(2);
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    // RATE LIMIT
    const now = Date.now();
    if (now - lastSubmitRef.current < 8000) {
      setLoading(false);
      return setError("Please wait a moment before submitting again.");
    }
    lastSubmitRef.current = now;

    // BOT CHECK (soft block)
    if (honeypot) {
      console.warn("Bot detected");
      setLoading(false);
      return;
    }

    // VALIDATION
    if (!isValidPhone(phone)) {
      setLoading(false);
      return setError("Enter a valid phone number.");
    }

    try {
      const payload = {
        email,
        phone: cleanedPhone,
        plan,
        lead_score: leadScore,
        intent: isHighIntent ? "high" : "medium",
        source: "apply_form",
      };

      // =========================
      // LEAD TRACKING (non-blocking)
      // =========================
      fetch("/api/leads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((err) => {
        console.error("Lead tracking failed:", err);
      });

      // =========================
      // CHECKOUT
      // =========================
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Checkout failed");
      }

      if (!data?.url) {
        throw new Error("Missing checkout URL");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-md p-8">

        {/* Honeypot */}
        <input
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
          autoComplete="off"
          tabIndex={-1}
        />

        <h1 className="text-2xl font-bold">
          Apply for Exclusive Roofing Leads
        </h1>

        <p className="text-sm text-gray-600 mt-2">
          Limited contractor access per territory.
        </p>

        <p className="text-xs text-gray-500 mt-2">
          Step {step} of 2
        </p>

        {/* PLAN */}
        <div className="mt-5">
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="w-full border rounded-lg p-2"
          >
            <option value="starter">Starter — $499/mo</option>
            <option value="growth">Growth — $999/mo</option>
            <option value="domination">Domination — $1999/mo</option>
          </select>
        </div>

        {/* INTENT INDICATOR */}
        <p
          className={`mt-3 text-sm font-semibold ${
            isHighIntent ? "text-green-600" : "text-yellow-600"
          }`}
        >
          {isHighIntent
            ? "High Intent Lead"
            : "Reviewing Application"}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          {step === 1 && (
            <>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Business Email"
                className="w-full border rounded-lg p-2"
              />

              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-black text-white py-2 rounded-lg"
              >
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <input
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="Phone Number"
                className="w-full border rounded-lg p-2"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded-lg"
              >
                {loading ? "Processing..." : "Secure My Territory"}
              </button>
            </>
          )}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

        </form>
      </div>
    </div>
  );
}