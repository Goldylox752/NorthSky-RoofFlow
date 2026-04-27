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

      {/* HEADER */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold">
          Simple Monthly Access
        </h1>

        <p className="mt-4 text-gray-600">
          Exclusive roofing lead access per territory. No shared leads.
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
            Start Starter
          </button>
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
            Start Growth
          </button>
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
            Start Domination
          </button>
        </div>

      </section>

    </main>
  );
}