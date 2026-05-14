"use client";

import { useRouter } from "next/navigation";
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
const TELEGRAM_BOT = "https://t.me/YOUR_BOT_USERNAME";

/* ===============================
   CHART DATA
=============================== */
const revenueData = [
  { month: "Jan", revenue: 12000 },
  { month: "Feb", revenue: 18000 },
  { month: "Mar", revenue: 22000 },
  { month: "Apr", revenue: 31000 },
  { month: "May", revenue: 48220 },
];

const leadData = [
  { name: "Mon", leads: 120 },
  { name: "Tue", leads: 180 },
  { name: "Wed", leads: 240 },
  { name: "Thu", leads: 210 },
  { name: "Fri", leads: 320 },
  { name: "Sat", leads: 280 },
  { name: "Sun", leads: 340 },
];

export default function HomePage() {
  const router = useRouter();

  const go = (plan: string) => {
    router.push(`/checkout?plan=${plan}`);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* GLOBAL LIGHTING */}
      <div className="absolute inset-0 -z-50 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_30%)]" />

      <div className="absolute inset-0 -z-40 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent)]" />

      <Navbar />

      <Hero go={go} />

      <Stats />

      <AnalyticsPreview />

      <Features />

      <Pricing go={go} />

      <OperationsPanel />

      <CTA go={go} />

      <Footer />

      <TelegramFloat />
    </main>
  );
}

/* ===============================
   NAVBAR
=============================== */
function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            NorthSky
          </h1>

          <p className="text-xs text-zinc-400">
            Automation Infrastructure
          </p>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            Features
          </a>

          <a
            href="#pricing"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            Pricing
          </a>

          <a href={TELEGRAM_BOT} target="_blank">
            <Button
              variant="outline"
              className="border-white/20 bg-white/5 backdrop-blur-xl"
            >
              Telegram Bot
            </Button>
          </a>

          <Button className="bg-white text-black hover:bg-zinc-200">
            Dashboard
          </Button>
        </nav>
      </div>
    </header>
  );
}

/* ===============================
   HERO
=============================== */
function Hero({ go }: any) {
  return (
    <section className="relative">
      <div className="mx-auto grid max-w-7xl items-center gap-20 px-6 py-32 md:grid-cols-2">
        <div>
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-300 backdrop-blur-xl">
            Telegram + Stripe + SaaS Automation
          </div>

          <h1 className="mt-8 text-6xl font-semibold leading-tight tracking-tight md:text-7xl">
            Operate your
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              {" "}
              automation SaaS
            </span>
            <br />
            from one platform
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-zinc-400">
            Production-ready infrastructure for lead routing, Stripe billing,
            Telegram automation, analytics, and real-time operations.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button
              size="lg"
              onClick={() => go("growth")}
              className="bg-white text-black hover:bg-zinc-200"
            >
              Launch Platform
            </Button>

            <a href={TELEGRAM_BOT} target="_blank">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 backdrop-blur-xl"
              >
                Open Telegram Bot
              </Button>
            </a>
          </div>

          <div className="mt-12 flex gap-10">
            <StatMini value="99.9%" label="Uptime" />
            <StatMini value="24/7" label="Automation" />
            <StatMini value="$1.2M+" label="Tracked Revenue" />
          </div>
        </div>

        {/* HERO GLASS PANEL */}
        <div className="relative">
          <div className="absolute -inset-10 rounded-full bg-indigo-500/20 blur-3xl" />

          <Card className="relative overflow-hidden border border-white/10 bg-white/5 p-8 shadow-[0_0_80px_rgba(99,102,241,0.15)] backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">
                  Operations Dashboard
                </h3>

                <p className="text-sm text-zinc-400">
                  Live infrastructure overview
                </p>
              </div>

              <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                LIVE
              </div>
            </div>

            <div className="mt-10 grid gap-4">
              <Metric title="Monthly Revenue" value="$48,220" />
              <Metric title="Telegram Automations" value="1,248" />
              <Metric title="Lead Conversion" value="24.8%" />
              <Metric title="Webhook Health" value="Operational" />
            </div>

            <div className="mt-10 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />

                  <XAxis
                    dataKey="month"
                    stroke="#71717a"
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="#71717a"
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#818cf8"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ===============================
   STATS
=============================== */
function Stats() {
  return (
    <section className="border-y border-white/10 bg-white/[0.02] backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 py-16 text-center md:grid-cols-4">
        <Stat value="12k+" label="Leads Processed" />
        <Stat value="$1.2M+" label="Revenue Tracked" />
        <Stat value="99.9%" label="Webhook Success" />
        <Stat value="24/7" label="Bot Automation" />
      </div>
    </section>
  );
}

/* ===============================
   ANALYTICS PREVIEW
=============================== */
function AnalyticsPreview() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <div className="mb-12">
        <h2 className="text-4xl font-semibold">
          Real-time analytics
        </h2>

        <p className="mt-4 max-w-2xl text-zinc-400">
          Monitor revenue growth, lead activity, Stripe events, and Telegram
          automation in one operational dashboard.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* REVENUE CHART */}
        <Card className="border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
          <div className="mb-6">
            <h3 className="text-lg font-medium">
              Revenue Growth
            </h3>

            <p className="text-sm text-zinc-400">
              Monthly Stripe revenue
            </p>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />

                <XAxis
                  dataKey="month"
                  stroke="#71717a"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="#71717a"
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* LEADS CHART */}
        <Card className="border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
          <div className="mb-6">
            <h3 className="text-lg font-medium">
              Lead Activity
            </h3>

            <p className="text-sm text-zinc-400">
              Daily processed leads
            </p>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadData}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />

                <XAxis
                  dataKey="name"
                  stroke="#71717a"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="#71717a"
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip />

                <Bar
                  dataKey="leads"
                  fill="#6366f1"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </section>
  );
}

/* ===============================
   FEATURES
=============================== */
function Features() {
  const items = [
    "Telegram Automation",
    "Stripe Billing Engine",
    "Lead Routing",
    "Webhook Infrastructure",
    "Real-time Analytics",
    "Enterprise SaaS Backend",
  ];

  return (
    <section
      id="features"
      className="mx-auto max-w-7xl px-6 py-28"
    >
      <div className="text-center">
        <h2 className="text-4xl font-semibold">
          Enterprise automation stack
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-zinc-400">
          Designed for scalable lead systems, SaaS infrastructure,
          and Telegram automation platforms.
        </p>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <Card
            key={item}
            className="group border border-white/10 bg-white/5 p-8 backdrop-blur-2xl transition hover:border-indigo-500/40 hover:bg-white/[0.07]"
          >
            <div className="text-lg font-medium">
              {item}
            </div>

            <p className="mt-4 text-sm leading-7 text-zinc-400">
              Production-ready infrastructure with scalable architecture and
              operational visibility.
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* ===============================
   PRICING
=============================== */
function Pricing({ go }: any) {
  const plans = [
    { title: "Starter", price: "$9" },
    { title: "Growth", price: "$29" },
    { title: "Enterprise", price: "$79" },
  ];

  return (
    <section
      id="pricing"
      className="mx-auto max-w-7xl px-6 py-28"
    >
      <div className="text-center">
        <h2 className="text-4xl font-semibold">
          Pricing
        </h2>

        <p className="mt-4 text-zinc-400">
          Flexible plans for automation businesses.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.title}
            className="relative overflow-hidden border border-white/10 bg-white/5 p-8 backdrop-blur-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent" />

            <div className="relative">
              <div className="text-xl font-medium">
                {plan.title}
              </div>

              <div className="mt-6 text-5xl font-semibold">
                {plan.price}
                <span className="text-lg text-zinc-400">
                  /mo
                </span>
              </div>

              <div className="mt-8 space-y-3 text-sm text-zinc-400">
                <div>✓ Telegram automation</div>
                <div>✓ Stripe subscriptions</div>
                <div>✓ Live dashboard</div>
                <div>✓ Analytics engine</div>
              </div>

              <Button
                className="mt-10 w-full bg-white text-black hover:bg-zinc-200"
                onClick={() => go(plan.title.toLowerCase())}
              >
                Start {plan.title}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* ===============================
   OPERATIONS PANEL
=============================== */
function OperationsPanel() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <Card className="overflow-hidden border border-white/10 bg-white/5 p-10 backdrop-blur-2xl">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <h2 className="text-4xl font-semibold">
              Infrastructure Status
            </h2>

            <p className="mt-5 max-w-xl text-zinc-400">
              Monitor Stripe billing, webhook processing,
              Telegram automations, and operational uptime.
            </p>
          </div>

          <div className="grid gap-4">
            <Status label="Stripe API" value="Operational" />
            <Status label="Telegram Bot" value="Connected" />
            <Status label="Webhook Queue" value="Healthy" />
            <Status label="Analytics Engine" value="Online" />
          </div>
        </div>
      </Card>
    </section>
  );
}

/* ===============================
   CTA
=============================== */
function CTA({ go }: any) {
  return (
    <section className="px-6 py-32 text-center">
      <h2 className="text-6xl font-semibold tracking-tight">
        Launch your automation infrastructure
      </h2>

      <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-zinc-400">
        Build a scalable SaaS platform with Stripe billing,
        Telegram automation, analytics, and production-ready architecture.
      </p>

      <Button
        size="lg"
        className="mt-10 bg-white px-10 text-black hover:bg-zinc-200"
        onClick={() => go("growth")}
      >
        Start Building
      </Button>
    </section>
  );
}

/* ===============================
   FLOATING TELEGRAM BUTTON
=============================== */
function TelegramFloat() {
  return (
    <a
      href={TELEGRAM_BOT}
      target="_blank"
      className="fixed bottom-6 right-6 z-50"
    >
      <Button className="border border-white/10 bg-white/10 shadow-[0_0_40px_rgba(99,102,241,0.35)] backdrop-blur-2xl hover:bg-white/20">
        Telegram Support
      </Button>
    </a>
  );
}

/* ===============================
   COMPONENTS
=============================== */
function Metric({ title, value }: any) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="text-sm text-zinc-400">
        {title}
      </div>

      <div className="font-medium text-white">
        {value}
      </div>
    </div>
  );
}

function Stat({ value, label }: any) {
  return (
    <div>
      <div className="text-4xl font-semibold">
        {value}
      </div>

      <div className="mt-3 text-sm text-zinc-400">
        {label}
      </div>
    </div>
  );
}

function StatMini({ value, label }: any) {
  return (
    <div>
      <div className="text-2xl font-semibold">
        {value}
      </div>

      <div className="mt-1 text-sm text-zinc-500">
        {label}
      </div>
    </div>
  );
}

function Status({ label, value }: any) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-5 py-4 backdrop-blur-xl">
      <div className="text-sm text-zinc-400">
        {label}
      </div>

      <div className="text-sm font-medium text-emerald-400">
        {value}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 py-10 text-center text-sm text-zinc-500">
      © {new Date().getFullYear()} NorthSky. All rights reserved.
    </footer>
  );
}