"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { getToken, clearToken } from "@/lib/auth";

type User = {
  email: string;
  plan: string;
  active: boolean;
};

export default function Dashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const token = getToken();

        if (!token) {
          router.push("/");
          return;
        }

        const res = await apiGet("/api/dashboard/access", token);

        if (!res.ok) {
          router.push("/");
          return;
        }

        const data = await res.json();

        if (!data.active) {
          router.push("/");
          return;
        }

        setUser(data);
      } catch (err) {
        console.error(err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [router]);

  if (loading) {
    return (
      <div style={{ padding: 40, minHeight: "100vh", background: "#0b0f17", color: "#fff" }}>
        Loading dashboard...
      </div>
    );
  }

  if (!user) return null;

  return (
    <main style={{ padding: 40, minHeight: "100vh", background: "#0b0f17", color: "#fff" }}>
      <h1>Flow OS Dashboard</h1>

      <p>Logged in as: {user.email}</p>
      <p>Plan: {user.plan}</p>

      <div style={{ marginTop: 20 }}>
        <h3>System Status</h3>
        <ul>
          <li>Stripe billing: Active</li>
          <li>Backend API: Running</li>
          <li>AI workflows: Enabled</li>
        </ul>
      </div>

      <button
        onClick={() => {
          clearToken();
          router.push("/");
        }}
        style={{ marginTop: 20 }}
      >
        Logout
      </button>
    </main>
  );
}