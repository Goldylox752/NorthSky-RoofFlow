export const metadata = {
  title: "Dashboard | RoofFlow",
  description:
    "RoofFlow contractor dashboard for managing roofing leads, appointments, and revenue.",
};



const stats = [
  {
    title:"New Leads",
    value:"48",
    change:"+18%",
    icon:"🏠",
  },
  {
    title:"Appointments",
    value:"16",
    change:"+12%",
    icon:"📅",
  },
  {
    title:"Jobs Won",
    value:"9",
    change:"+24%",
    icon:"✅",
  },
  {
    title:"Revenue",
    value:"$84,500",
    change:"+31%",
    icon:"💰",
  },
];



const leads = [
  {
    name:"Sarah Johnson",
    location:"Edmonton, AB",
    service:"Roof Replacement",
    value:"$12,000",
    status:"New",
  },
  {
    name:"Mike Thompson",
    location:"Sherwood Park, AB",
    service:"Roof Repair",
    value:"$3,500",
    status:"Contacted",
  },
  {
    name:"Westview Home",
    location:"Leduc, AB",
    service:"Storm Damage",
    value:"$18,000",
    status:"Inspection",
  },
];



const pipeline = [
  {
    stage:"New Leads",
    count:48,
  },
  {
    stage:"Qualified",
    count:24,
  },
  {
    stage:"Inspections",
    count:12,
  },
  {
    stage:"Closed Jobs",
    count:9,
  },
];



export default function DashboardPage(){


return (

<main className="min-h-screen bg-slate-950 text-white">


<div className="max-w-7xl mx-auto p-8">



{/* Header */}

<div className="flex justify-between items-center mb-10">


<div>

<p className="text-blue-400 font-semibold">
RoofFlow Contractor Portal
</p>


<h1 className="text-4xl font-bold mt-2">
Welcome Back 👋
</h1>


<p className="text-slate-400 mt-2">
Manage your roofing business growth.
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
Sales Pipeline
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


</div>


))}


</div>


</section>









{/* Leads */}

<section className="mt-10">


<div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">


<div className="p-6">

<h2 className="text-2xl font-bold">
Recent Leads
</h2>

</div>




<table className="w-full">


<thead className="bg-slate-800">

<tr className="text-left">

<th className="p-4">
Customer
</th>

<th className="p-4">
Location
</th>

<th className="p-4">
Service
</th>

<th className="p-4">
Value
</th>

<th className="p-4">
Status
</th>

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
</td>


<td className="p-4 text-slate-400">
{lead.location}
</td>


<td className="p-4">
{lead.service}
</td>


<td className="p-4 text-green-400">
{lead.value}
</td>


<td className="p-4">

<span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs">
{lead.status}
</span>

</td>


</tr>


))}


</tbody>


</table>


</div>


</section>








{/* AI Assistant */}

<section className="mt-10">


<div className="bg-blue-600 rounded-2xl p-8">


<h2 className="text-3xl font-bold">
🤖 RoofFlow AI Assistant
</h2>


<p className="mt-3 text-blue-100">

"3 homeowners need follow-up today. 
Your highest opportunity is the Edmonton storm repair lead."

</p>


<button className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-lg font-bold">

View Recommendations

</button>


</div>


</section>



</div>


</main>

);

}