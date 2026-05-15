import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { forecastRevenue } from "@/server/ai/revenueForecast";

import { Card } from "@/components/ui/card";

type Lead = {
  id: string;
  value: number | null;
  score: number | null;
  status: string | null;
};

export default async function HomePage() {
  const { orgId } = await auth();

  if (!orgId) {
    redirect("/");
  }

  /* ===============================
     FETCH LEADS
  =============================== */

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("org_id", orgId);

  if (error) {
    console.error(error);
  }

  const leads: Lead[] = data ?? [];

  /* ===============================
     STATS
  =============================== */

  const stats = calculateStats(leads);

  /* ===============================
     AI FORECAST
  =============================== */

  const forecast = await getForecast(leads);

  return (
    <div className="space-y-6">
      <Header />

      <KpiGrid
        stats={stats}
        forecast={forecast}
      />

      <AiInsight forecast={forecast} />

      <SystemStatus stats={stats} />

      <QuickActions />
    </div>
  );
}

/* ===============================
   TYPES
=============================== */

type Stats = {
  total: number;
  pipelineValue: number;
  avgScore: number;
  active: Lead[];
  won: Lead[];
  fresh: Lead[];
};

type Forecast = {
  forecast_30_days: number;
  confidence: number;
  insights: string;
};

/* ===============================
   DATA
=============================== */

function calculateStats(leads: Lead[]): Stats {
  const total = leads.length;

  const pipelineValue = leads.reduce(
    (sum, lead) => sum + (lead.value ?? 0),
    0
  );

  const avgScore =
    total === 0
      ? 0
      : leads.reduce(
          (sum, lead) => sum + (lead.score ?? 0),
          0
        ) / total;

  const active = leads.filter(
    (lead) =>
      lead.status !== "won" &&
      lead.status !== "lost"
  );

  const won = leads.filter(
    (lead) => lead.status === "won"
  );

  const fresh = leads.filter(
    (lead) => lead.status === "new"
  );

  return {
    total,
    pipelineValue,
    avgScore,
    active,
    won,
    fresh,
  };
}

/* ===============================
   FORECAST
=============================== */

async function getForecast(
  leads: Lead[]
): Promise<Forecast> {
  if (!leads.length) {
    return {
      forecast_30_days: 0,
      confidence: 0,
      insights: "Not enough data",
    };
  }

  try {
    return await forecastRevenue(leads);

  } catch (error) {
    console.error(error);

    return {
      forecast_30_days: 0,
      confidence: 0,
      insights: "Forecast unavailable",
    };
  }
}

/* ===============================
   UI
=============================== */

function Header() {
  return (
    <div>
      <h1 className="text-3xl font-semibold">
        AI Revenue System
      </h1>

      <p className="text-sm text-white/60">
        Autonomous sales intelligence overview
      </p>
    </div>
  );
}

function KpiGrid({
  stats,
  forecast,
}: {
  stats: Stats;
  forecast: Forecast;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <Kpi
        label="Total Leads"
        value={stats.total}
      />

      <Kpi
        label="Avg Score"
        value={stats.avgScore.toFixed(1)}
      />

      <Kpi
        label="Pipeline Value"
        value={`$${stats.pipelineValue}`}
      />

      <Kpi
        label="Forecast (30d)"
        value={`$${forecast.forecast_30_days}`}
      />
    </div>
  );
}

function AiInsight({
  forecast,
}: {
  forecast: Forecast;
}) {
  return (
    <Card className="p-4">
      <h2 className="font-semibold">
        AI Insight
      </h2>

      <p className="mt-2 text-sm text-white/70">
        Confidence: {forecast.confidence}%
      </p>

      <p className="mt-2 text-sm text-white/70">
        {forecast.insights}
      </p>
    </Card>
  );
}

function SystemStatus({
  stats,
}: {
  stats: Stats;
}) {
  return (
    <Card className="p-4">
      <h2 className="mb-3 font-semibold">
        System Status
      </h2>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <Metric
          label="Active Leads"
          value={stats.active.length}
        />

        <Metric
          label="Closed Deals"
          value={stats.won.length}
        />

        <Metric
          label="New Intake"
          value={stats.fresh.length}
        />
      </div>
    </Card>
  );
}

function QuickActions() {
  return (
    <Card className="p-4">
      <h2 className="mb-3 font-semibold">
        Quick Actions
      </h2>

      <div className="flex flex-wrap gap-3">
        <Action href="/leads">
          View Leads
        </Action>

        <Action href="/pipeline">
          Open Pipeline
        </Action>

        <Action href="/analytics">
          Analytics
        </Action>
      </div>
    </Card>
  );
}

function Kpi({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-white/10 p-4">
      <div className="text-sm text-white/60">
        {label}
      </div>

      <div className="mt-1 text-2xl font-semibold">
        {value}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <div className="text-xl font-semibold">
        {value}
      </div>

      <div className="text-white/60">
        {label}
      </div>
    </div>
  );
}

function Action({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="rounded border border-white/20 px-3 py-2 text-sm transition hover:bg-white hover:text-black"
    >
      {children}
    </a>
  );
}