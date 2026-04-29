"use client";

import { useState } from "react";

export default function LeadForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [aiReply, setAiReply] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setAiReply("");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          location: form.city,
          message: form.message,
          source: "website_form",
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed");

      setSuccess("We’ve received your request. Check your phone — we’ll text you shortly.");
      setAiReply(data.aiMessage || "");

      setForm({
        name: "",
        phone: "",
        email: "",
        city: "",
        message: "",
      });

    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Get Your Free Estimate</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} style={styles.input} required />
        <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} style={styles.input} required />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} style={styles.input} />
        <input name="city" placeholder="City" value={form.city} onChange={handleChange} style={styles.input} required />
        <textarea name="message" placeholder="Tell us what you need..." value={form.message} onChange={handleChange} style={styles.textarea} />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Sending..." : "Get Estimate"}
        </button>

        {success && <p style={styles.success}>{success}</p>}
        {error && <p style={styles.error}>{error}</p>}

        {aiReply && (
          <div style={styles.aiBox}>
            <strong>Instant AI Response Preview:</strong>
            <p>{aiReply}</p>
          </div>
        )}
      </form>
    </div>
  );
}