"use client";

export default function Pricing() {
  const subscribe = async (priceId) => {
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to start checkout");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <main className="bg-white text-gray-900">

      {/* URGENCY BANNER */}
      <div className="bg-black text-white text-center py-3 text-sm">
        ⚠️ Only 1 contractor per territory — availability updates in real time
      </div>

      {/* HEADER */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold">
          Exclusive Roofing Leads by Territory
        </h1>

        <p className="mt-4 text-gray-600">
          Locked territories. No shared leads. High-intent homeowners only.
        </p>

        <div className="mt-6 text-sm text-gray-500">
          🔥 Avg ROI: 3–7x per closed job <br />
          ⚡ Leads delivered instantly <br />
          📍 One contractor per area only
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="max-w-5xl mx-auto px-6 pb-6 text-center">
        <p className="text-sm text-gray-500">
          Trusted by contractors scaling consistent high-ticket roofing jobs across Western Canada
        </p>
      </section>

      {/* PRICING */}
      <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-6">

        {/* STARTER */}
        <div className="border rounded-xl p-6">
          <h2 className="font-bold">Starter</h2>
          <p className="text-gray-600">$499 / month</p>
          <p className="text-sm text-gray-500 mb-4">
            5–10 qualified requests
          </p>

          <button
            onClick={() => subscribe("price_STARTER_ID")}
            className="w-full bg-black text-white py-2 rounded-lg"
          >
            Secure Territory → Starter
          </button>

          <p className="text-xs text-gray-500 mt-2">
            Cancel anytime. Keep all leads generated during subscription.
          </p>
        </div>

        {/* GROWTH */}
        <div className="border-2 border-black rounded-xl p-6">
          <h2 className="font-bold">Growth</h2>
          <p className="text-gray-600">$999 / month</p>
          <p className="text-sm text-gray-500 mb-4">
            15–30 booked opportunities
          </p>

          <button
            onClick={() => subscribe("price_GROWTH_ID")}
            className="w-full bg-black text-white py-2 rounded-lg"
          >
            Get More Jobs → Growth
          </button>

          <p className="text-xs text-gray-500 mt-2">
            Cancel anytime. Keep all leads generated during subscription.
          </p>
        </div>

        {/* DOMINATION */}
        <div className="border rounded-xl p-6">
          <h2 className="font-bold">Domination</h2>
          <p className="text-gray-600">$1,999 / month</p>
          <p className="text-sm text-gray-500 mb-4">
            Exclusive territory control
          </p>

          <button
            onClick={() => subscribe("price_DOMINATION_ID")}
            className="w-full bg-black text-white py-2 rounded-lg"
          >
            Lock Market → Domination
          </button>

          <p className="text-xs text-gray-500 mt-2">
            Cancel anytime. Full territory exclusivity while active.
          </p>
        </div>

      </section>
    </main>
  );
}