import Head from "next/head";

export default function Home() {

  async function checkout(plan) {

    try {

      const res = await fetch("/api/checkout", {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({ plan })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      if (data.url) {
        window.location.href = data.url;
      }

    } catch (err) {

      console.error(err);

      alert(err.message || "Something went wrong");

    }

  }

  return (
    <>
      <Head>
        <title>NorthSky | AI Automation Platform</title>

        <meta
          name="description"
          content="NorthSky automates lead conversion using AI workflows, Stripe billing, and CRM automation."
        />

        <meta
          property="og:title"
          content="NorthSky | AI Automation Platform"
        />

        <meta
          property="og:description"
          content="Convert more leads automatically with AI-powered workflows."
        />

        <meta
          property="og:type"
          content="website"
        />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
      </Head>

      <main className="bg-black text-white min-h-screen">

        {/* NAVBAR */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">

            <div className="font-semibold text-xl">
              NorthSky
            </div>

            <nav className="flex gap-6 text-sm text-zinc-400">

              <a
                href="#pricing"
                className="hover:text-white transition"
              >
                Pricing
              </a>

              <a
                href="#"
                className="hover:text-white transition"
              >
                Support
              </a>

            </nav>

          </div>
        </header>

        {/* HERO */}
        <section className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 px-6 py-28">

          <div>

            <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-4 py-2 text-sm text-zinc-300 backdrop-blur">
              AI-Powered Revenue Automation
            </div>

            <h1 className="text-5xl md:text-6xl font-semibold leading-tight mt-6">
              Convert more leads automatically with AI sales workflows
            </h1>

            <p className="mt-6 text-zinc-400 text-lg max-w-2xl">
              NorthSky helps service businesses capture,
              qualify, and convert inbound leads using AI automation,
              Stripe billing, and CRM integrations.
            </p>

            <div className="mt-10 flex gap-4 items-center flex-wrap">

              <button
                onClick={() => checkout("growth")}
                className="bg-indigo-500 hover:bg-indigo-400 transition px-6 py-3 rounded-xl font-medium"
              >
                Start Free Trial
              </button>

              <a
                href="#pricing"
                className="text-zinc-400 hover:text-white transition underline"
              >
                View Pricing
              </a>

            </div>

            <div className="mt-10 flex gap-8 text-sm text-zinc-500 flex-wrap">

              <div>✓ AI Lead Routing</div>
              <div>✓ CRM Automation</div>
              <div>✓ Stripe Billing</div>
              <div>✓ 24/7 Workflows</div>

            </div>

          </div>

          {/* DASHBOARD */}
          <div className="bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-6 space-y-6">

            <div className="flex items-center justify-between">

              <div>
                <div className="text-sm text-zinc-500">
                  Qualified Leads
                </div>

                <div className="text-3xl font-semibold mt-1">
                  1,248
                </div>
              </div>

              <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm">
                +18.2%
              </div>

            </div>

            <div className="space-y-4">

              <div>

                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400">
                    Lead Qualification
                  </span>

                  <span>92%</span>
                </div>

                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full w-[92%]"></div>
                </div>

              </div>

              <div>

                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400">
                    Workflow Automation
                  </span>

                  <span>87%</span>
                </div>

                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full w-[87%]"></div>
                </div>

              </div>

              <div>

                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400">
                    Conversion Optimization
                  </span>

                  <span>78%</span>
                </div>

                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full w-[78%]"></div>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* TRUST BAR */}
        <section className="border-y border-white/10 bg-white/5">

          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10 text-center px-6 py-14">

            <div>

              <div className="text-3xl font-semibold">
                24/7
              </div>

              <div className="text-sm text-zinc-400 mt-2">
                AI automation uptime
              </div>

            </div>

            <div>

              <div className="text-3xl font-semibold">
                Instant
              </div>

              <div className="text-sm text-zinc-400 mt-2">
                lead qualification & routing
              </div>

            </div>

            <div>

              <div className="text-3xl font-semibold">
                Automated
              </div>

              <div className="text-sm text-zinc-400 mt-2">
                CRM + billing workflows
              </div>

            </div>

          </div>

        </section>

        {/* FEATURES */}
        <section className="max-w-7xl mx-auto px-6 py-28">

          <div className="max-w-4xl">

            <h2 className="text-4xl font-semibold leading-tight">
              Replace manual follow-up with AI-powered conversion systems
            </h2>

            <p className="mt-6 text-zinc-400 text-lg">
              NorthSky automatically captures leads,
              qualifies high-intent customers,
              syncs data into your CRM,
              and triggers automated billing workflows.
            </p>

          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

              <h3 className="text-xl font-medium">
                AI Lead Qualification
              </h3>

              <p className="mt-4 text-zinc-400">
                Automatically identify and prioritize
                high-converting inbound leads.
              </p>

            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

              <h3 className="text-xl font-medium">
                CRM Automation
              </h3>

              <p className="mt-4 text-zinc-400">
                Sync customer data instantly into your
                existing sales workflow.
              </p>

            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

              <h3 className="text-xl font-medium">
                Stripe Billing
              </h3>

              <p className="mt-4 text-zinc-400">
                Automate subscriptions,
                invoices, and payment collection.
              </p>

            </div>

          </div>

        </section>

        {/* PRICING */}
        <section
          id="pricing"
          className="max-w-7xl mx-auto px-6 py-28"
        >

          <h2 className="text-4xl font-semibold">
            Simple pricing
          </h2>

          <p className="mt-4 text-zinc-400">
            Built for growing service businesses and sales teams.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-12">

            {/* STARTER */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">

              <h3 className="text-2xl font-semibold">
                Starter
              </h3>

              <div className="text-5xl font-semibold mt-6">
                $49
                <span className="text-lg text-zinc-400">
                  /mo
                </span>
              </div>

              <ul className="mt-8 space-y-4 text-zinc-400 text-sm">
                <li>✓ AI lead routing</li>
                <li>✓ CRM integrations</li>
                <li>✓ Basic workflows</li>
              </ul>

              <button
                onClick={() => checkout("starter")}
                className="w-full mt-10 bg-zinc-800 hover:bg-zinc-700 transition py-3 rounded-xl"
              >
                Get Started
              </button>

            </div>

            {/* GROWTH */}
            <div className="bg-white/5 border border-indigo-500 rounded-2xl p-8">

              <div className="text-xs uppercase tracking-wide text-indigo-400 mb-4">
                Most Popular
              </div>

              <h3 className="text-2xl font-semibold">
                Growth
              </h3>

              <div className="text-5xl font-semibold mt-6">
                $149
                <span className="text-lg text-zinc-400">
                  /mo
                </span>
              </div>

              <ul className="mt-8 space-y-4 text-zinc-400 text-sm">
                <li>✓ Unlimited workflows</li>
                <li>✓ AI qualification engine</li>
                <li>✓ Stripe automation</li>
                <li>✓ Advanced analytics</li>
              </ul>

              <button
                onClick={() => checkout("growth")}
                className="w-full mt-10 bg-indigo-500 hover:bg-indigo-400 transition py-3 rounded-xl"
              >
                Start Free Trial
              </button>

            </div>

            {/* ELITE */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">

              <h3 className="text-2xl font-semibold">
                Elite
              </h3>

              <div className="text-5xl font-semibold mt-6">
                Custom
              </div>

              <ul className="mt-8 space-y-4 text-zinc-400 text-sm">
                <li>✓ Dedicated onboarding</li>
                <li>✓ Enterprise workflows</li>
                <li>✓ API integrations</li>
                <li>✓ Priority support</li>
              </ul>

              <button
                onClick={() => checkout("elite")}
                className="w-full mt-10 bg-zinc-800 hover:bg-zinc-700 transition py-3 rounded-xl"
              >
                Contact Sales
              </button>

            </div>

          </div>

        </section>

        {/* CTA */}
        <section className="py-28 text-center px-6">

          <h2 className="text-5xl font-semibold max-w-4xl mx-auto leading-tight">
            Stop losing leads to slow follow-up and manual workflows
          </h2>

          <p className="mt-6 text-zinc-400 text-lg max-w-2xl mx-auto">
            NorthSky automates qualification,
            routing, billing, and CRM workflows
            so your team can focus on closing more business.
          </p>

          <button
            onClick={() => checkout("growth")}
            className="mt-10 bg-indigo-500 hover:bg-indigo-400 transition px-8 py-4 rounded-xl"
          >
            Launch NorthSky
          </button>

        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 py-10 text-center text-sm text-zinc-500">
          © {new Date().getFullYear()} NorthSky. All rights reserved.
        </footer>

      </main>
    </>
  );

}