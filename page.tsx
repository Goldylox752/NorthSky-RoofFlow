import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { forecastRevenue } from "@/server/ai/revenueForecast";
import { Card } from "@/components/ui/card";

export default async function HomePage() {
  const { orgId } = auth();

  if (!orgId) {
    return (
      <div className="p-6 text-sm text-white/70">
        No organization selected
      </div>
    );
  }

  const leads = await db.lead.findMany({
    where: { orgId },
  });

  const safeLeads = leads ?? [];

  const stats = calculateStats(safeLeads);

  const forecast = await getForecast(safeLeads);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <Header />

      {/* KPI */}
      <KpiGrid stats={stats} forecast={forecast} />

      {/* AI INSIGHT */}
      <AiInsight forecast={forecast} />

      {/* SYSTEM STATUS */}
      <SystemStatus stats={stats} />

      {/* ACTIONS */}
      <QuickActions />
    </div>
  );
}

/* ===============================
   DATA LOGIC (CLEAN SEPARATION)
=============================== */
function calculateStats(leads: any[]) {
  const total = leads.length;

  const pipelineValue = leads.reduce(
    (sum, l) => sum + (l.value ?? 0),
    0
  );

  const avgScore =
    total === 0
      ? 0
      : leads.reduce((sum, l) => sum + (l.score ?? 0), 0) / total;

  const active = leads.filter(
    (l) => l.status !== "won" && l.status !== "lost"
  );

  const won = leads.filter((l) => l.status === "won");
  const fresh = leads.filter((l) => l.status === "new");

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
   AI (SAFE GUARD)
=============================== */
async function getForecast(leads: any[]) {
  if (!leads || leads.length === 0) {
    return {
      forecast_30_days: 0,
      confidence: 0,
      insights: "Not enough data",
    };
  }

  try {
    return await forecastRevenue(leads);
  } catch {
    return {
      forecast_30_days: 0,
      confidence: 0,
      insights: "Forecast unavailable",
    };
  }
}

/* ===============================
   UI COMPONENTS
=============================== */

function Header() {
  return (
    <div>
      <h1 className="text-3xl font-semibold">AI Revenue System</h1>
      <p className="text-white/60 text-sm">
        Autonomous sales intelligence overview
      </p>
    </div>
  );
}

function KpiGrid({
  stats,
  forecast,
}: {
  stats: any;
  forecast: any;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Kpi label="Total Leads" value={stats.total} />
      <Kpi label="Avg Score" value={stats.avgScore.toFixed(1)} />
      <Kpi
        label="Pipeline Value"
        value={`$${stats.pipelineValue}`}
      />
      <Kpi
        label="Forecast (30d)"
        value={`$${forecast.forecast_30_days ?? 0}`}
      />
    </div>
  );
}

function AiInsight({ forecast }: { forecast: any }) {
  return (
    <Card className="p-4">
      <h2 className="font-semibold">AI Insight</h2>

      <p className="text-white/70 text-sm mt-2">
        Confidence: {forecast.confidence ?? 0}%
      </p>

      <p className="text-white/70 text-sm mt-2">
        {forecast.insights ?? "No insights available"}
      </p>
    </Card>
  );
}

function SystemStatus({ stats }: { stats: any }) {
  return (
    <Card className="p-4">
      <h2 className="font-semibold mb-3">System Status</h2>

      <div className="grid grid-cols-3 text-sm gap-4">
        <Metric label="Active Leads" value={stats.active.length} />
        <Metric label="Closed Deals" value={stats.won.length} />
        <Metric label="New Intake" value={stats.fresh.length} />
      </div>
    </Card>
  );
}

function QuickActions() {
  return (
    <Card className="p-4">
      <h2 className="font-semibold mb-3">Quick Actions</h2>

      <div className="flex gap-3 flex-wrap">
        <Action href="/leads">View Leads</Action>
        <Action href="/pipeline">Open Pipeline</Action>
        <Action href="/ai">AI Control Panel</Action>
        <Action href="/analytics">Analytics</Action>
      </div>
    </Card>
  );
}

/* ===============================
   SMALL UI PRIMITIVES
=============================== */

function Kpi({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="border border-white/10 rounded-xl p-4">
      <div className="text-white/60 text-sm">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
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
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-white/60">{label}</div>
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
      className="px-3 py-2 text-sm border border-white/20 rounded hover:bg-white hover:text-black transition"
    >
      {children}
    </a>
  );
}