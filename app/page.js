export default function Home() {
  return (
    <main className="bg-white text-gray-900">

      {/* HERO (HOOK + URGENCY) */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">

        <p className="text-sm text-red-600 font-medium">
          Limited contractor spots available per city
        </p>

        <h1 className="text-4xl md:text-5xl font-bold leading-tight mt-3">
          Roofing Leads That Turn Into Booked Jobs — Not Clicks
        </h1>

        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          RoofFlow connects roofing contractors with verified homeowners actively requesting estimates in your service area. No cold traffic. No shared leads. Just real demand.
        </p>

        <div className="mt-8 flex gap-4 justify-center flex-wrap">
          <a
            href="/apply"
            className="bg-black text-white px-6 py-3 rounded-lg font-medium"
          >
            Apply for Access
          </a>

          <a
            href="#how-it-works"
            className="border border-gray-300 px-6 py-3 rounded-lg font-medium"
          >
            See How It Works
          </a>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          Exclusive territories only • Approval required per region
        </p>
      </section>

      {/* PAIN SECTION */}
      <section className="bg-gray-50 py-20 px-6 text-center">
        <h2 className="text-3xl font-bold">
          Why Most Contractors Waste Their Budget
        </h2>

        <div className="mt-10 max-w-3xl mx-auto space-y-4 text-gray-600">
          <p>• Paying for clicks with no real buying intent</p>
          <p>• Shared leads sent to multiple contractors</p>
          <p>• Low-quality inquiries that never convert</p>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center">
          The RoofFlow System
        </h2>

        <div className="mt-10 grid md:grid-cols-3 gap-6">

          <div className="p-6 border rounded-xl">
            <h3 className="font-semibold mb-2">1. Capture Demand</h3>
            <p className="text-gray-600">
              Homeowners actively request roofing estimates in your area.
            </p>
          </div>

          <div className="p-6 border rounded-xl">
            <h3 className="font-semibold mb-2">2. Qualify Leads</h3>
            <p className="text-gray-600">
              Every lead is filtered by intent, urgency, and location.
            </p>
          </div>

          <div className="p-6 border rounded-xl">
            <h3 className="font-semibold mb-2">3. Book Jobs</h3>
            <p className="text-gray-600">
              You receive ready-to-book appointments, not raw leads.
            </p>
          </div>

        </div>
      </section>

      {/* COMPARISON */}
      <section className="bg-gray-900 text-white py-20 px-6">
        <h2 className="text-3xl font-bold text-center">
          RoofFlow vs Traditional Lead Sources
        </h2>

        <div className="mt-10 grid md:grid-cols-3 gap-6">

          <div className="p-6 bg-gray-800 rounded-xl">
            <h3 className="font-semibold mb-2">Google Ads</h3>
            <p className="text-gray-300">
              Pay per click with unpredictable results and low intent.
            </p>
          </div>

          <div className="p-6 bg-gray-800 rounded-xl">
            <h3 className="font-semibold mb-2">Lead Brokers</h3>
            <p className="text-gray-300">
              Same lead sold to multiple competing contractors.
            </p>
          </div>

          <div className="p-6 bg-green-600 rounded-xl">
            <h3 className="font-semibold mb-2">RoofFlow</h3>
            <p>
              Exclusive homeowner requests with verified intent.
            </p>
          </div>

        </div>
      </section>

      {/* PROOF */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold">
          Contractor Results
        </h2>

        <div className="mt-10 grid md:grid-cols-2 gap-6 text-left">

          <div className="p-6 border rounded-xl">
            <p className="text-gray-700">
              “Every lead is real intent. We stopped wasting time on junk inquiries.”
            </p>
            <span className="text-sm text-gray-500 mt-3 block">
              — Roofing Contractor, Alberta
            </span>
          </div>

          <div className="p-6 border rounded-xl">
            <p className="text-gray-700">
              “Booked inspections within the first week.”
            </p>
            <span className="text-sm text-gray-500 mt-3 block">
              — Roofing Business Owner
            </span>
          </div>

        </div>
      </section>

      {/* SCARCITY BLOCK (NEW - IMPORTANT) */}
      <section className="bg-gray-50 py-20 px-6 text-center">
        <h2 className="text-3xl font-bold">
          Contractor Availability
        </h2>

        <p className="mt-4 text-gray-600">
          We limit access per city to maintain lead quality.
        </p>

        <div className="mt-6 text-lg font-semibold text-red-600">
          Only 2 contractor spots remaining in Alberta region
        </div>
      </section>

      {/* SERVICE AREAS */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold">
          Active Service Areas
        </h2>

        <div className="mt-8 flex flex-wrap justify-center gap-4 text-blue-600">
          <a href="/roofing-leads/edmonton">Edmonton</a>
          <a href="/roofing-leads/calgary">Calgary</a>
          <a href="/roofing-leads/leduc">Leduc</a>
          <a href="/roofing-leads/red-deer">Red Deer</a>
        </div>
      </section>

      {/* PRICING (WITH ANCHORING) */}
      <section className="bg-gray-50 py-20 px-6">
        <h2 className="text-3xl font-bold text-center">
          Simple Monthly Access
        </h2>

        <div className="mt-10 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">

          <div className="p-6 border rounded-xl">
            <h3 className="font-semibold">Starter</h3>
            <p className="text-gray-600">$499 / month</p>
          </div>

          <div className="p-6 border-2 border-black rounded-xl">
            <h3 className="font-semibold">Growth (Recommended)</h3>
            <p className="text-gray-600">$999 / month</p>
          </div>

          <div className="p-6 border rounded-xl">
            <h3 className="font-semibold">Domination</h3>
            <p className="text-gray-600">$1,999 / month</p>
          </div>

        </div>

        <div className="text-center mt-10">
          <a
            href="/apply"
            className="bg-black text-white px-6 py-3 rounded-lg"
          >
            Apply for Access
          </a>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="text-center py-24 px-6">
        <h2 className="text-3xl font-bold">
          Ready to stop chasing leads?
        </h2>

        <p className="text-gray-600 mt-3">
          Get exclusive roofing appointments in your area.
        </p>

        <a
          href="/apply"
          className="mt-6 inline-block bg-black text-white px-8 py-3 rounded-lg"
        >
          Get Access Now
        </a>
      </section>

    </main>
  );
}
