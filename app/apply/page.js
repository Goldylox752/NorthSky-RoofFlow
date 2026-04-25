"use client";

import { useState } from "react";

export default function Apply() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Apply to RoofFlow</h1>

      <form onSubmit={handleSubmit}>
        {/* EMAIL */}
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10, marginTop: 10, display: "block" }}
        />

        {/* PHONE */}
        <input
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ padding: 10, marginTop: 10, display: "block" }}
        />

        <button
          type="submit"
          style={{ marginTop: 15, padding: 10 }}
        >
          Continue to Checkout
        </button>
      </form>
    </div>
  );
}
