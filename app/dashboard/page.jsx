export const metadata = {
  title: "RoofFlow Dashboard | Contractor OS",
  description:
    "Manage roofing leads, appointments, sales pipeline, AI follow-ups, and revenue with RoofFlow.",
};


const stats = [
  {
    title: "New Leads",
    value: "48",
    change: "+18%",
    icon: "🏠",
  },
  {
    title: "Appointments",
    value: "16",
    change: "+12%",
    icon: "📅",
  },
  {
    title: "Jobs Won",
    value: "9",
    change: "+24%",
    icon: "✅",
  },
  {
    title: "Pipeline Value",
    value: "$142,500",
    change: "+31%",
    icon: "💰",
  },
];


const leads = [
  {
    name: "Sarah Johnson",
    location: "Edmonton, AB",
    service: "Roof Replacement",
    value: "$12,000",
    score: "95%",
    status: "Hot Lead",
  },
  {
    name: "Mike Thompson",
    location: "Sherwood Park, AB",
    service: "Roof Repair",
    value: "$3,500",
    score: "82%",
    status: "Contacted",
  },
  {
    name: "Westview Home",
    location: "Leduc, AB",
    service: "Storm Damage",
    value: "$18,000",
    score: "98%",
    status: "Inspection",
  },
];


const pipeline = [
  {
    stage: "New Leads",
    count: 48,
    value: "$85K",
  },
  {
    stage: "Qualified",
    count: 24,
    value: "$62K",
  },
  {
    stage: "Inspections",
    count: 12,
    value: "$38K",
  },
  {
    stage: "Closed Jobs",
    count: 9,
    value: "$142K",
  },
];


export default function DashboardPage() {

return (

<main className="min-h-screen bg-slate-950 text-white">


<div className="flex">


{/* Sidebar */}

<aside className="hidden md:block w-64 bg-slate-900 min-h-screen p-6 border-r border-slate-800">

<h2 className="text-2xl font-bold text-blue-400">
RoofFlow
</h2>


<nav className="mt-10 space-y-4 text-slate-300">

<p>📊 Dashboard</p>
<p>🏠 Leads</p>
<p>📅 Appointments</p>
<p>💰 Revenue</p>
<p>🤖 AI Assistant</p>
<p>⚙️ Settings</p>

</nav>

</aside>





{/* Main */}

<div className="flex-1 p-8 max-w-7xl">



{/* Header */}

<div className="flex justify-between items-center mb-10">


<div>

<p className="text-blue-400 font-semibold">
RoofFlow Contractor OS
</p>


<h1 className="text-4xl font-bold mt-2">
Welcome Back 👋
</h1>


<p className="text-slate-400 mt-2">
Your roofing business growth command center.
</p>

</div>



<button className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-lg">
+ Add Lead
</button>


</div>






{/* Stats */}

<div className="grid md:grid-cols-4 gap-6">


{stats.map((stat)=>(

<div
key={stat.title}
className="bg-slate-900 border border-slate-800 rounded-xl p-6"
>

<div className="text-3xl">
{stat.icon}
</div>


<p className="text-slate-400 mt-4">
{stat.title}
</p>


<h2 className="text-3xl font-bold mt-2">
{stat.value}
</h2>


<p className="text-green-400 mt-2">
{stat.change}
</p>


</div>

))}


</div>








{/* Pipeline */}

<section className="mt-10">

<h2 className="text-2xl font-bold mb-5">
Revenue Pipeline
</h2>


<div className="grid md:grid-cols-4 gap-5">


{pipeline.map((item)=>(

<div
key={item.stage}
className="bg-slate-900 border border-slate-800 rounded-xl p-5"
>


<p className="text-slate-400">
{item.stage}
</p>


<h3 className="text-3xl font-bold mt-3">
{item.count}
</h3>


<p className="text-blue-400 mt-2">
{item.value}
</p>


</div>

))}


</div>

</section>








{/* Leads */}

<section className="mt-10">

<div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">


<div className="p-6">

<h2 className="text-2xl font-bold">
Lead Marketplace
</h2>

</div>


<table className="w-full">


<thead className="bg-slate-800">

<tr className="text-left">

<th className="p-4">Customer</th>
<th className="p-4">Service</th>
<th className="p-4">Value</th>
<th className="p-4">AI Score</th>
<th className="p-4">Status</th>

</tr>

</thead>


<tbody>


{leads.map((lead)=>(

<tr
key={lead.name}
className="border-t border-slate-800"
>

<td className="p-4 font-semibold">
{lead.name}
<p className="text-sm text-slate-400">
{lead.location}
</p>
</td>


<td className="p-4">
{lead.service}
</td>


<td className="p-4 text-green-400">
{lead.value}
</td>


<td className="p-4 text-blue-400">
{lead.score}
</td>


<td className="p-4">
{lead.status}
</td>


</tr>

))}


</tbody>


</table>


</div>


</section>








{/* AI */}

<section className="mt-10">


<div className="bg-blue-600 rounded-2xl p-8">


<h2 className="text-3xl font-bold">
🤖 RoofFlow AI Sales Assistant
</h2>


<p className="mt-3 text-blue-100">

3 homeowners need follow-up today.
AI recommends calling the Edmonton storm damage lead first.

</p>


<button className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-lg font-bold">
Generate Action Plan
</button>


</div>


</section>


</div>


</div>


</main>

);

}