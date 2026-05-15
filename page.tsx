import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const { orgId } = auth();

  if (!orgId) {
    return (
      <div className="p-6 text-white">
        No organization selected.
      </div>
    );
  }

  const leads = await db.lead.findMany({
    where: { orgId },
  });

  const totalLeads = leads.length;

  const pipelineValue = leads.reduce(
    (sum, l) => sum + l.value,
    0
  );

  const avgScore =
    totalLeads === 0
      ? 0
      : leads.reduce((sum, l) => sum + l.score, 0) /
        totalLeads;

  const wonDeals = leads.filter(l => l.status === "won").length;

  const mrr = leads
    .filter(l => l.status === "won")
    .reduce((sum, l) => sum + l.value, 0);

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold">
          Revenue OS
        </h1>
        <p className="text-white/60">
          AI-powered revenue intelligence dashboard
        </p>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <KPI label="Leads" value={totalLeads} />
        <KPI label="Pipeline" value={`$${pipelineValue}`} />
        <KPI label="MRR" value={`$${mrr}`} />
        <KPI label="Avg Score" value={avgScore.toFixed(1)} />

      </div>

      {/* INSIGHT BOX */}
      <div className="border border-white/10 rounded-xl p-5">
        <h2 className="font-semibold mb-2">
          AI Insight
        </h2>

        <p className="text-white/70 text-sm">
          {avgScore > 70
            ? "Strong lead quality. Focus on closing high-intent leads and scaling outreach."
            : "Lead quality is moderate. Improve targeting and qualification strategy."}
        </p>
      </div>

      {/* PIPELINE SUMMARY */}
      <div className="border border-white/10 rounded-xl p-5">
        <h2 className="font-semibold mb-4">
          Pipeline Overview
        </h2>

        <div className="grid grid-cols-3 gap-6 text-sm">

          <div>
            <div className="text-xl font-semibold">
              {totalLeads}
            </div>
            <div className="text-white/60">
              Total Leads
            </div>
          </div>

          <div>
            <div className="text-xl font-semibold">
              {wonDeals}
            </div>
            <div className="text-white/60">
              Won Deals
            </div>
          </div>

          <div>
            <div className="text-xl font-semibold">
              {((wonDeals / (totalLeads || 1)) * 100).toFixed(1)}%
            </div>
            <div className="text-white/60">
              Close Rate
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

/* ---------------- KPI COMPONENT ---------------- */

function KPI({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="border border-white/10 rounded-xl p-4">
      <div className="text-white/60 text-sm">{label}</div>
      <div className="text-2xl font-semibold mt-1">
        {value}
      </div>
    </div>
  );
}