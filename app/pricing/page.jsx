import Link from "next/link";


export const metadata = {
  title: "RoofFlow Pricing | Roofing Growth Plans",
  description:
    "Choose a RoofFlow plan to get qualified roofing leads, AI follow-ups, and contractor growth tools.",
};



const plans = [
  {
    name: "Starter",
    price: "$499",
    description:
      "Perfect for roofing companies building a consistent pipeline.",
    features: [
      "Qualified roofing leads",
      "Contractor dashboard",
      "Lead notifications",
      "Basic reporting",
      "Single service area",
    ],
  },

  {
    name: "Growth",
    price: "$999",
    popular: true,
    description:
      "For roofing companies ready to scale faster.",
    features: [
      "Everything in Starter",
      "AI lead qualification",
      "Automated follow-ups",
      "Advanced analytics",
      "Multiple campaigns",
      "Priority lead matching",
    ],
  },

  {
    name: "Domination",
    price: "$1,999",
    description:
      "For companies expanding into multiple markets.",
    features: [
      "Everything in Growth",
      "Premium lead volume",
      "AI sales assistant",
      "Multiple locations",
      "Custom growth strategy",
      "Dedicated support",
    ],
  },
];



const comparison = [
  {
    feature:"Lead Marketplace",
    starter:"✓",
    growth:"✓",
    domination:"✓",
  },
  {
    feature:"AI Follow-Up",
    starter:"—",
    growth:"✓",
    domination:"✓",
  },
  {
    feature:"Advanced Analytics",
    starter:"—",
    growth:"✓",
    domination:"✓",
  },
  {
    feature:"Multiple Locations",
    starter:"—",
    growth:"—",
    domination:"✓",
  },
];



export default function PricingPage(){


return (

<main className="min-h-screen bg-slate-950 text-white">


<div className="max-w-7xl mx-auto px-8 py-20">



{/* Header */}

<section className="text-center">


<p className="text-blue-400 font-semibold">
RoofFlow SaaS Pricing
</p>


<h1 className="text-5xl font-bold mt-4">
Scale Your Roofing Business
</h1>


<p className="text-slate-400 text-lg mt-5 max-w-2xl mx-auto">

Choose the plan that fits your growth stage.
Generate more opportunities, automate sales,
and close more roofing jobs.

</p>


</section>









{/* Plans */}

<section className="grid md:grid-cols-3 gap-8 mt-14">


{plans.map((plan)=>(


<div
key={plan.name}
className={`relative bg-slate-900 border rounded-2xl p-8 ${
plan.popular
?"border-blue-500 shadow-lg"
:"border-slate-800"
}`}
>


{plan.popular && (

<div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 px-4 py-1 rounded-full text-sm">

Most Popular

</div>

)}



<h2 className="text-3xl font-bold">
{plan.name}
</h2>


<p className="text-slate-400 mt-3">
{plan.description}
</p>




<div className="mt-8">

<span className="text-5xl font-bold">
{plan.price}
</span>

<span className="text-slate-400">
/month
</span>

</div>






<ul className="mt-8 space-y-4">


{plan.features.map((feature)=>(


<li
key={feature}
className="flex gap-3"
>

<span className="text-green-400">
✓
</span>

{feature}

</li>


))}


</ul>







<Link
href="/apply"
className={`block text-center mt-10 py-3 rounded-lg font-bold ${
plan.popular
?"bg-blue-600 hover:bg-blue-700"
:"bg-slate-800 hover:bg-slate-700"
}`}
>

Get Started

</Link>




</div>


))}


</section>









{/* Comparison */}

<section className="mt-20">


<h2 className="text-3xl font-bold mb-6">
Plan Comparison
</h2>


<div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">


<table className="w-full">


<thead className="bg-slate-800">

<tr>

<th className="p-4 text-left">
Feature
</th>

<th className="p-4">
Starter
</th>

<th className="p-4">
Growth
</th>

<th className="p-4">
Domination
</th>

</tr>

</thead>



<tbody>


{comparison.map((item)=>(


<tr
key={item.feature}
className="border-t border-slate-800"
>


<td className="p-4 font-semibold">
{item.feature}
</td>


<td className="p-4 text-center">
{item.starter}
</td>


<td className="p-4 text-center">
{item.growth}
</td>


<td className="p-4 text-center">
{item.domination}
</td>


</tr>


))}


</tbody>


</table>


</div>


</section>









{/* CTA */}

<section className="mt-20 bg-blue-600 rounded-2xl p-10 text-center">


<h2 className="text-4xl font-bold">
Ready to fill your calendar?
</h2>


<p className="mt-4 text-blue-100">
Start receiving qualified roofing opportunities today.
</p>


<Link
href="/apply"
className="inline-block mt-6 bg-white text-blue-600 px-8 py-3 rounded-lg font-bold"
>

Apply Now

</Link>


</section>



</div>


</main>

);

}