"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeads = async () => {
    setError("");

    try {
      setLoading(true);

      const res = await fetch("/api/leads", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch leads");
      }

      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load leads. Please try again.");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>RoofFlow Dashboard</h1>

      <p style={styles.subtext}>Real-time lead pipeline overview</p>

      <div style={styles.headerRow}>
        <h3 style={styles.sectionTitle}>Active Leads</h3>

        <button
          onClick={fetchLeads}
          style={styles.refreshBtn}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* LOADING STATE */}
      {loading && <p style={styles.text}>Loading leads...</p>}

      {/* ERROR STATE */}
      {error && <p style={styles.error}>{error}</p>}

      {/* EMPTY STATE */}
      {!loading && leads.length === 0 && !error && (
        <p style={styles.text}>No leads yet.</p>
      )}

      {/* LEADS LIST */}
      <div style={styles.list}>
        {leads.map((l) => (
          <div key={l.id} style={styles.card}>
            <b>{l.email || "No email"}</b>

            <p style={styles.meta}>
              Status: {l.status || "unknown"} | Stage: {l.stage || "new"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 40,
    fontFamily: "Arial",
    background: "#0b1220",
    minHeight: "100vh",
    color: "white",
  },

  title: {
    fontSize: 28,
    marginBottom: 5,
  },

  subtext: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 20,
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
  },

  refreshBtn: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid #333",
    background: "#111827",
    color: "white",
    cursor: "pointer",
    fontSize: 12,
  },

  text: {
    opacity: 0.7,
  },

  error: {
    color: "#ff6b6b",
    marginBottom: 10,
  },

  list: {
    marginTop: 10,
  },

  card: {
    background: "#111827",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    border: "1px solid #1f2937",
  },

  meta: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 5,
  },
};
