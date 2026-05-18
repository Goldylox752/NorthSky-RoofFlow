"use client";

import { useState, FormEvent } from "react";

export default function BookingPage() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      time: form.get("time"),
    };

    try {
      await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      alert("Booking request sent!");
      e.currentTarget.reset();
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.badge}>RoofFlow Onboarding</div>

        <h1>You’re Qualified</h1>

        <p>Schedule your onboarding call so we can activate your system.</p>

        <form onSubmit={onSubmit}>
          <input name="name" placeholder="Full Name" required />
          <input name="email" placeholder="Email" required />
          <input name="phone" placeholder="Phone" required />

          <select name="time" required>
            <option value="">Preferred Time</option>
            <option>Morning</option>
            <option>Afternoon</option>
            <option>Evening</option>
          </select>

          <button disabled={loading}>
            {loading ? "Sending..." : "Request Call"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0b1220",
    color: "white",
  },
  card: {
    width: "100%",
    maxWidth: 600,
    padding: 40,
    background: "#121a2b",
    borderRadius: 16,
  },
  badge: {
    display: "inline-block",
    marginBottom: 10,
    fontSize: 12,
    opacity: 0.7,
  },
};