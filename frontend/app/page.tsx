"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  BarChart,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/* ===============================
   CONFIG
=============================== */
const TELEGRAM_BOT =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL ?? "#";

/* ===============================
   ANIMATION
=============================== */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

/* ===============================
   PAGE
=============================== */
export default function HomePage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const revenueData = useMemo(
    () => [
      { month: "Jan", revenue: 12000 },
      { month: "Feb", revenue: 18000 },
      { month: "Mar", revenue: 22000 },
      { month: "Apr", revenue: 31000 },
      { month: "May", revenue: 48220 },
    ],
    []
  );

  const leadData = useMemo(
    () => [
      { name: "Mon", leads: 120 },
      { name: "Tue", leads: 180 },
      { name: "Wed", leads: 240 },
      { name: "Thu", leads: 210 },
      { name: "Fri", leads: 320 },
      { name: "Sat", leads: 280 },
      { name: "Sun", leads: 340 },
    ],
    []
  );

  /* ===============================
     STRIPE CHECKOUT (REAL FLOW)
  =============================== */
  const go = useCallback(async (plan: string) => {
    if (!plan) return;

    try {
      setLoadingPlan(plan);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoadingPlan(null);
    }
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <Background />

      <Navbar />

      <Hero go={go} loadingPlan={loadingPlan} />

      <Stats />

      <Analytics revenueData={revenueData} leadData={leadData} />

      <Features />

      <Pricing go={go} loadingPlan={loadingPlan} />

      <Operations />

      <CTA go={go} />

      <Footer />
    </main>
  );
}

/* ===============================
   BACKGROUND
=============================== */
function Background() {
  return (
    <div className="absolute inset-0 -z-50 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_35%)]" />
  );
}

/* ===============================
   NAVBAR
=============================== */
function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-2xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div>
          <h1 className="text-xl font-semibold">NorthSky</h1>
          <p className="text-xs text-zinc-400">Automation Infrastructure</p>
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <a href="#features" className="text-sm text-zinc-400 hover:text-white">
            Features
          </a>
          <a href="#pricing" className="text-sm text-zinc-400 hover:text-white">
            Pricing
          </a>

          <a href={TELEGRAM_BOT} target="_blank" rel="noreferrer">
            <Button variant="outline">Telegram</Button>
          </a>
        </div>
      </div>
    </motion.header>
  );
}

/* ===============================
   HERO
=============================== */
function Hero({
  go,
  loadingPlan,
}: {
  go: (plan: string) => void;
  loadingPlan: string | null;
}) {
  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={stagger}
      className="mx-auto grid max-w-7xl gap-16 px-6 py-28 md:grid-cols-2"
    >
      <motion.div variants={fadeUp}>
        <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-300">
          SaaS + Telegram Automation
        </div>

        <h1 className="mt-8 text-6xl font-semibold leading-tight">
          Operate your{" "}
          <span className="text-indigo-400">automation SaaS</span>
        </h1>

        <p className="mt-6 text-zinc-400">
          Stripe billing, Telegram bots, lead routing, analytics — unified.
        </p>

        <div className="mt-10 flex gap-4">
          <Button onClick={() => go("growth")}>
            {loadingPlan === "growth" ? "Loading..." : "Launch"}
          </Button>

          <a href={TELEGRAM_BOT} target="_blank" rel="noreferrer">
            <Button variant="outline">Telegram</Button>
          </a>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
          <h3 className="text-lg font-medium">Live Dashboard</h3>
          <p className="text-sm text-zinc-400">Real-time system</p>

          <div className="mt-6 space-y-3">
            <Metric title="Revenue" value="$48,220" />
            <Metric title="Leads" value="1,248" />
            <Metric title="Conversion" value="24.8%" />
          </div>
        </Card>
      </motion.div>
    </motion.section>
  );
}

/* ===============================
   STATS
=============================== */
function Stats() {
  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={stagger}
      className="border-y border-white/10 bg-white/[0.02]"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 py-16 md:grid-cols-4">
        {[
          ["12k+", "Leads"],
          ["$1.2M+", "Revenue"],
          ["99.9%", "Uptime"],
          ["24/7", "Automation"],
        ].map(([v, l]) => (
          <motion.div key={l} variants={fadeUp}>
            <div className="text-4xl font-semibold">{v}</div>
            <div className="text-sm text-zinc-400">{l}</div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

/* ===============================
   ANALYTICS
=============================== */
function Analytics({
  revenueData,
  leadData,
}: {
  revenueData: any[];
  leadData: any[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <h2 className="text-4xl font-semibold">Analytics</h2>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <ChartCard title="Revenue">
          <Chart type="area" dataKey="revenue" data={revenueData} />
        </ChartCard>

        <ChartCard title="Leads">
          <Chart type="bar" dataKey="leads" data={leadData} />
        </ChartCard>
      </div>
    </section>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-white/5 p-6 border border-white/10">
      <h3>{title}</h3>
      {children}
    </Card>
  );
}

/* ===============================
   FEATURES
=============================== */
function Features() {
  const items = [
    "Telegram Bot System",
    "Stripe Automation",
    "Lead Engine",
    "Webhook Layer",
    "Analytics Core",
    "SaaS Backend",
  ];

  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-28">
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((i) => (
          <Card key={i} className="bg-white/5 p-6 border border-white/10">
            {i}
          </Card>
        ))}
      </div>
    </section>
  );
}

/* ===============================
   PRICING (STRIPE READY)
=============================== */
function Pricing({
  go,
  loadingPlan,
}: {
  go: (plan: string) => void;
  loadingPlan: string | null;
}) {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-28">
      <div className="grid gap-6 md:grid-cols-3">
        {["starter", "growth", "elite"].map((p) => (
          <Card key={p} className="bg-white/5 p-6 border border-white/10">
            <h3 className="capitalize">{p}</h3>

            <Button className="mt-6 w-full" onClick={() => go(p)}>
              {loadingPlan === p ? "Redirecting..." : "Upgrade"}
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* ===============================
   CTA / FOOTER / HELPERS
=============================== */
function CTA({ go }: { go: (plan: string) => void }) {
  return (
    <section className="text-center py-28">
      <h2 className="text-5xl font-semibold">Launch your system</h2>
      <Button className="mt-8" onClick={() => go("growth")}>
        Start
      </Button>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 py-10 text-center text-sm text-zinc-500">
      © {new Date().getFullYear()} NorthSky
    </footer>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-zinc-400">{title}</span>
      <span>{value}</span>
    </div>
  );
}

function Chart({
  type,
  dataKey,
  data,
}: {
  type: "area" | "bar";
  dataKey: string;
  data: any[];
}) {
  return (
    <div className="h-[240px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        {type === "area" ? (
          <AreaChart data={data}>
            <CartesianGrid stroke="#222" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area dataKey={dataKey} stroke="#6366f1" fill="#6366f1" />
          </AreaChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid stroke="#222" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey={dataKey} fill="#6366f1" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}