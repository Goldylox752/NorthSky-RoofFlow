"use client";

export default function BuyLeads() {
  const buyLead = async (priceId) => {
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
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-20 text-center">

      <h1 className="text-3xl font-bold">
        Buy Verified Roofing Leads
      </h1>

      <p className="text-gray-600 mt-3">
        Pay only for what you need. Instant delivery after purchase.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mt-10">

        <div className="border rounded-xl p-6">
          <h2 className="font-bold">Hot Lead</h2>
          <p className="text-gray-600">$49</p>
          <button
            onClick={() => buyLead("price_hot_lead")}
            className="mt-4 bg-black text-white px-4 py-2 rounded-lg w-full"
          >
            Buy Lead
          </button>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="font-bold">Verified Lead</h2>
          <p className="text-gray-600">$99</p>
          <button
            onClick={() => buyLead("price_verified_lead")}
            className="mt-4 bg-black text-white px-4 py-2 rounded-lg w-full"
          >
            Buy Lead
          </button>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="font-bold">Exclusive Lead</h2>
          <p className="text-gray-600">$149</p>
          <button
            onClick={() => buyLead("price_exclusive_lead")}
            className="mt-4 bg-black text-white px-4 py-2 rounded-lg w-full"
          >
            Buy Lead
          </button>
        </div>

      </div>
    </main>
  );
}