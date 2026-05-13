"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/* ===============================
   BOT CONFIG
=============================== */
const TELEGRAM_BOT = "https://t.me/YOUR_BOT_USERNAME"; // 🔁 change this

export default function HomePage() {
  const router = useRouter();

  const go = (plan) => {
    router.push(`/checkout?plan=${plan}`);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero go={go} />
      <TrustBar />
      <ProblemSolution />
      <Features />
      <Pricing go={go} />
      <CTA go={go} />
      <Footer />

      {/* Floating Bot Button */}
      <TelegramFloat />
    </main>
  );
}

/* ================= NAV ================= */
function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="font-semibold tracking-tight">LaunchKit</div>

        <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
          <a className="hover:text-foreground" href="#features">Features</a>
          <a className="hover:text-foreground" href="#pricing">Pricing</a>
        </nav>

        <div className="flex items-center gap-2">
          <a href={TELEGRAM_BOT} target="_blank">
            <Button size="sm" variant="outline">
              Telegram Bot
            </Button>
          </a>

          <Button size="sm">Sign in</Button>
        </div>
      </div>
    </header>
  );
}

/* ================= HERO ================= */
function Hero({ go }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/40 to-background" />

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-28 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Built for SaaS founders + automation systems
          </p>

          <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
            Run your SaaS
            <br />
            + Telegram bot in one system
          </h1>

          <p className="mt-6 text-lg text-muted-foreground">
            Leads, Stripe billing, automation, and a Telegram bot dashboard —
            all connected into one platform.
          </p>

          <div className="mt-8 flex gap-3">
            <Button size="lg" onClick={() => go("starter")}>
              Start SaaS
            </Button>

            <a href={TELEGRAM_BOT} target="_blank">
              <Button size="lg" variant="outline">
                Open Telegram Bot
              </Button>
            </a>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Manage everything from Telegram or web dashboard.
          </p>
        </div>

        <div className="relative">
          <div className="rounded-2xl border bg-muted/30 p-6 shadow-xl">
            <p className="text-sm font-medium">Bot Dashboard</p>

            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Leads</span>
                <span className="text-foreground">Live</span>
              </div>

              <div className="flex justify-between">
                <span>Stripe</span>
                <span className="text-green-500">Connected</span>
              </div>

              <div className="flex justify-between">
                <span>Telegram Bot</span>
                <span className="text-foreground">Active</span>
              </div>
            </div>
          </div>

          <div className="absolute -inset-10 -z-10 bg-indigo-500/10 blur-3xl" />
        </div>
      </div>
    </section>
  );
}

/* ================= BOT FLOAT ================= */
function TelegramFloat() {
  return (
    <a
      href={TELEGRAM_BOT}
      target="_blank"
      className="fixed bottom-6 right-6 z-50"
    >
      <Button className="shadow-lg">
        Chat on Telegram
      </Button>
    </a>
  );
}

/* ================= TRUST ================= */
function TrustBar() {
  return (
    <section className="border-y py-10 text-center text-sm text-muted-foreground">
      SaaS + Telegram automation system for modern lead businesses
    </section>
  );
}

/* ================= PROBLEM / SOLUTION ================= */
function ProblemSolution() {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-6 py-24 md:grid-cols-2">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-red-400">Before</h3>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>No bot automation</li>
          <li>Manual lead handling</li>
          <li>Disconnected Stripe system</li>
        </ul>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-green-400">After</h3>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Telegram bot controls SaaS</li>
          <li>Auto lead routing</li>
          <li>Stripe billing automation</li>
        </ul>
      </Card>
    </section>
  );
}

/* ================= FEATURES ================= */
function Features() {
  const items = [
    ["Telegram Bot", "Control leads & alerts"],
    ["Stripe Billing", "Auto payments & subscriptions"],
    ["Lead Engine", "Smart routing system"],
    ["SaaS Dashboard", "Full control panel"],
    ["Automation", "No manual work"],
    ["Scalable backend", "Production-ready"],
  ];

  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="text-center text-3xl font-semibold">
        Everything connected in one system
      </h2>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {items.map(([title, desc]) => (
          <Card key={title} className="p-6">
            <div className="font-medium">{title}</div>
            <div className="mt-2 text-sm text-muted-foreground">{desc}</div>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* ================= PRICING ================= */
function Pricing({ go }) {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="text-center text-3xl font-semibold">Pricing</h2>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <Plan title="Starter" price="$9" go={() => go("starter")} />
        <Plan title="Growth" price="$29" go={() => go("growth")} />
        <Plan title="Elite" price="$79" go={() => go("elite")} />
      </div>
    </section>
  );
}

function Plan({ title, price, go }) {
  return (
    <Card className="p-8 text-center">
      <div className="font-medium">{title}</div>
      <div className="mt-4 text-4xl font-semibold">{price}</div>

      <Button className="mt-6 w-full" onClick={go}>
        Get started
      </Button>
    </Card>
  );
}

/* ================= CTA ================= */
function CTA({ go }) {
  return (
    <section className="py-28 text-center">
      <h2 className="text-4xl font-semibold">
        Launch your SaaS + bot system
      </h2>

      <Button className="mt-8" size="lg" onClick={() => go("starter")}>
        Start now
      </Button>
    </section>
  );
}

/* ================= FOOTER ================= */
function Footer() {
  return (
    <footer className="border-t py-10 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} LaunchKit
    </footer>
  );
}