import Link from "next/link";

export const metadata = {
  title: "RoofFlow | AI Roofing Sales Platform | Book More Roofing Jobs",
  description:
    "RoofFlow helps roofing contractors generate qualified homeowner leads, automate sales follow-ups, book inspections, and grow revenue with AI-powered roofing technology.",
};

const features = [
  {
    title: "Exclusive Roofing Leads",
    description:
      "Get homeowner opportunities looking for roof repairs, replacements, inspections, and estimates.",
    icon: "🏠",
  },
  {
    title: "AI Roofing Receptionist",
    description:
      "Automatically answer questions, qualify homeowners, and schedule appointments 24/7.",
    icon: "🤖",
  },
  {
    title: "Contractor CRM",
    description:
      "Manage leads, appointments, customers, and sales pipelines from one dashboard.",
    icon: "📋",
  },
  {
    title: "Revenue Analytics",
    description:
      "Track lead sources, conversion rates, booked jobs, and company growth.",
    icon: "📈",
  },
];


const stats = [
  {
    value: "24/7",
    label: "AI Customer Response",
  },
  {
    value: "3x",
    label: "More Lead Follow-Up",
  },
  {
    value: "10,000+",
    label: "Homeowner Opportunities",
  },
  {
    value: "$1M+",
    label: "Revenue Potential",
  },
];


const plans = [
  {
    name: "Starter",
    price: "$499/mo",
    description:
      "For roofing companies looking to generate consistent opportunities.",
  },
  {
    name: "Growth",
    price: "$999/mo",
    description:
      "For contractors scaling teams and increasing monthly revenue.",
  },
  {
    name: "Domination",
    price: "$1,999/mo",
    description:
      "For companies wanting aggressive market expansion.",
  },
];


export default function Home() {

return (

<main className="min-h-screen bg-slate-950 text-white">


{/* Hero */}

<section className="max-w-7xl mx-auto px-8 pt-24 pb-20">

<div className="grid md:grid-cols-2 gap-12 items-center">


<div>

<p className="text-blue-400 font-semibold uppercase tracking-wide">
AI Roofing Growth Platform
</p>


<h1 className="text-5xl md:text-6xl font-bold mt-5 leading-tight">

We Book Roofing Jobs
<br />

While You Build.

</h1>


<p className="text-slate-400 text-lg mt-6">

RoofFlow gives roofing contractors an AI-powered sales system that captures homeowners, follows up instantly, and turns opportunities into booked inspections.

</p>


<div className="flex gap-4 mt-8">


<Link
href="/apply"
className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
>
Get More Roofing Jobs
</Link>


<Link
href="/pricing"
className="border border-slate-700 px-6 py-3 rounded-lg"
>
View Plans
</Link>


</div>


</div>



<div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">


<div className="flex justify-between">

<h3 className="text-2xl font-bold">
RoofFlow AI Engine
</h3>

<span className="text-green-400">
● Online
</span>

</div>


<div className="mt-6 space-y-4">


<div className="bg-slate-800 p-4 rounded-lg">
🏠 Homeowner requested roof estimate
</div>


<div className="bg-slate-800 p-4 rounded-lg">
🤖 AI qualified project value: $14,500
</div>


<div className="bg-slate-800 p-4 rounded-lg">
📅 Inspection booked for tomorrow
</div>


</div>


</div>


</div>

</section>




{/* Stats */}

<section className="max-w-7xl mx-auto px-8">

<div className="grid md:grid-cols-4 gap-6">


{stats.map((item)=>(

<div
key={item.label}
className="bg-slate-900 border border-slate-800 rounded-xl p-6"
>

<h2 className="text-3xl font-bold text-blue-400">
{item.value}
</h2>

<p className="text-slate-400 mt-2">
{item.label}
</p>

</div>

))}


</div>

</section>





{/* Features */}

<section className="max-w-7xl mx-auto px-8 py-20">


<h2 className="text-4xl font-bold text-center">

Everything Needed To Scale A Roofing Company

</h2>


<p className="text-center text-slate-400 mt-4">
One platform for leads, automation, sales, and growth.
</p>



<div className="grid md:grid-cols-4 gap-6 mt-10">


{features.map((feature)=>(

<div
key={feature.title}
className="bg-slate-900 border border-slate-800 rounded-xl p-6"
>


<div className="text-3xl">
{feature.icon}
</div>


<h3 className="text-xl font-bold mt-4">
{feature.title}
</h3>


<p className="text-slate-400 mt-3">
{feature.description}
</p>


</div>

))}


</div>


</section>






{/* Pricing */}

<section className="max-w-7xl mx-auto px-8 pb-20">


<h2 className="text-4xl font-bold text-center">
Plans Built For Roofing Growth
</h2>


<div className="grid md:grid-cols-3 gap-6 mt-10">


{plans.map((plan)=>(


<div
key={plan.name}
className="bg-slate-900 border border-slate-800 rounded-xl p-8"
>


<h3 className="text-2xl font-bold">
{plan.name}
</h3>


<p className="text-4xl font-bold mt-5 text-blue-400">
{plan.price}
</p>


<p className="text-slate-400 mt-4">
{plan.description}
</p>


<Link
href="/apply"
className="block text-center mt-6 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg"
>
Start Growing
</Link>


</div>


))}


</div>


</section>






{/* CTA */}

<section className="max-w-7xl mx-auto px-8 pb-20">


<div className="bg-blue-600 rounded-2xl p-10 text-center">


<h2 className="text-4xl font-bold">
Stop Chasing Leads. Start Closing Jobs.
</h2>


<p className="mt-4 text-blue-100">
RoofFlow helps contractors create a predictable roofing sales machine.
</p>


<Link
href="/apply"
className="inline-block mt-6 bg-white text-blue-600 px-8 py-3 rounded-lg font-bold"
>
Apply For RoofFlow
</Link>


</div>


</section>


</main>

);

}