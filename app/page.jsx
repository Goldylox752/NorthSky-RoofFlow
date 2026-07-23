import Link from "next/link";


export const metadata = {
  title: "RoofFlow | Book More Roofing Jobs Automatically",
  description:
    "RoofFlow helps roofing contractors get qualified leads, automate follow-ups, and grow revenue with AI-powered roofing sales systems.",
};



const features = [
  {
    title: "Qualified Roofing Leads",
    description:
      "Receive homeowner opportunities ready for roofing quotes and inspections.",
    icon: "🏠",
  },
  {
    title: "AI Lead Follow-Up",
    description:
      "Automatically respond, qualify, and schedule appointments with prospects.",
    icon: "🤖",
  },
  {
    title: "Contractor Dashboard",
    description:
      "Manage leads, jobs, appointments, and revenue from one platform.",
    icon: "📊",
  },
  {
    title: "Growth Analytics",
    description:
      "Track campaigns, conversions, and your highest-performing channels.",
    icon: "📈",
  },
];



const stats = [
  {
    value: "10,000+",
    label: "Potential Homeowners",
  },
  {
    value: "24/7",
    label: "AI Lead Response",
  },
  {
    value: "3x",
    label: "More Follow-Ups",
  },
  {
    value: "$1M+",
    label: "Revenue Opportunity",
  },
];



const plans = [
  {
    name:"Starter",
    price:"$499/mo",
    description:"For growing roofing companies.",
  },
  {
    name:"Growth",
    price:"$999/mo",
    description:"For contractors scaling faster.",
  },
  {
    name:"Domination",
    price:"$1,999/mo",
    description:"For roofing companies wanting market control.",
  },
];



export default function Home(){


return (

<main className="min-h-screen bg-slate-950 text-white">


{/* Hero */}

<section className="max-w-7xl mx-auto px-8 pt-24 pb-20">


<div className="grid md:grid-cols-2 gap-12 items-center">


<div>


<p className="text-blue-400 font-semibold">
Roofing Growth Platform
</p>


<h1 className="text-5xl md:text-6xl font-bold mt-5 leading-tight">

Book More Roofing Jobs.
<br />

Close More Deals.

</h1>


<p className="text-slate-400 text-lg mt-6">

RoofFlow helps roofing contractors generate qualified leads,
automate follow-ups, and turn more homeowners into customers.

</p>



<div className="flex gap-4 mt-8">


<Link
href="/apply"
className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
>
Get Started
</Link>


<Link
href="/dashboard"
className="border border-slate-700 px-6 py-3 rounded-lg"
>
Contractor Dashboard
</Link>


</div>


</div>




<div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">


<h3 className="text-2xl font-bold">
RoofFlow AI Assistant
</h3>


<div className="mt-6 space-y-4">


<div className="bg-slate-800 p-4 rounded-lg">
🏠 New homeowner lead received
</div>


<div className="bg-slate-800 p-4 rounded-lg">
🤖 AI qualified customer
</div>


<div className="bg-slate-800 p-4 rounded-lg">
📅 Inspection booked
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

<h2 className="text-3xl font-bold">
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
Everything Roofing Companies Need
</h2>


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
Choose Your Growth Plan
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


<button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg">
Start Growing
</button>


</div>


))}


</div>


</section>







{/* CTA */}

<section className="max-w-7xl mx-auto px-8 pb-20">


<div className="bg-blue-600 rounded-2xl p-10 text-center">


<h2 className="text-4xl font-bold">
Ready to Fill Your Roofing Calendar?
</h2>


<p className="mt-4 text-blue-100">
Join contractors using RoofFlow to generate more opportunities.
</p>


<Link
href="/apply"
className="inline-block mt-6 bg-white text-blue-600 px-8 py-3 rounded-lg font-bold"
>
Apply Now
</Link>


</div>


</section>



</main>

);

}