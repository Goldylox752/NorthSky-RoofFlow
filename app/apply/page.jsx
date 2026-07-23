export const metadata = {
  title: "Apply | RoofFlow",
  description:
    "Apply to join RoofFlow and start receiving qualified roofing opportunities.",
};


export default function ApplyPage() {


return (

<main className="min-h-screen bg-slate-950 text-white">


<div className="max-w-3xl mx-auto px-8 py-20">



<div className="text-center mb-10">


<p className="text-blue-400 font-semibold">
RoofFlow Contractor Network
</p>


<h1 className="text-5xl font-bold mt-4">
Grow Your Roofing Business
</h1>


<p className="text-slate-400 mt-4">
Apply to access qualified roofing leads, AI follow-ups,
and contractor growth tools.
</p>


</div>






<form className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">



<div>

<label className="text-sm text-slate-400">
Company Name
</label>

<input
className="w-full mt-2 bg-slate-800 rounded-lg p-3 outline-none"
placeholder="ABC Roofing"
/>

</div>





<div>

<label className="text-sm text-slate-400">
Contact Name
</label>

<input
className="w-full mt-2 bg-slate-800 rounded-lg p-3 outline-none"
placeholder="John Smith"
/>

</div>






<div>

<label className="text-sm text-slate-400">
Email
</label>

<input
type="email"
className="w-full mt-2 bg-slate-800 rounded-lg p-3 outline-none"
placeholder="company@email.com"
/>

</div>







<div>

<label className="text-sm text-slate-400">
Phone Number
</label>

<input
className="w-full mt-2 bg-slate-800 rounded-lg p-3 outline-none"
placeholder="(555) 555-5555"
/>

</div>







<div>

<label className="text-sm text-slate-400">
Service Area
</label>

<input
className="w-full mt-2 bg-slate-800 rounded-lg p-3 outline-none"
placeholder="Edmonton, Alberta"
/>

</div>








<div>

<label className="text-sm text-slate-400">
Monthly Roofing Capacity
</label>


<select className="w-full mt-2 bg-slate-800 rounded-lg p-3">

<option>
1-5 jobs/month
</option>

<option>
5-15 jobs/month
</option>

<option>
15-50 jobs/month
</option>

<option>
50+ jobs/month
</option>

</select>


</div>








<div>

<label className="text-sm text-slate-400">
Current Lead Source
</label>


<select className="w-full mt-2 bg-slate-800 rounded-lg p-3">

<option>
Google Ads
</option>

<option>
SEO
</option>

<option>
Referrals
</option>

<option>
Facebook
</option>

<option>
Other
</option>

</select>


</div>









<button
type="submit"
className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-lg font-bold text-lg"
>

Submit Application

</button>



</form>







<div className="grid md:grid-cols-3 gap-5 mt-10">


<div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

<h3 className="font-bold">
🚀 More Leads
</h3>

<p className="text-slate-400 mt-2">
Connect with homeowners needing roofing services.
</p>

</div>



<div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

<h3 className="font-bold">
🤖 AI Follow-Up
</h3>

<p className="text-slate-400 mt-2">
Respond faster and book more inspections.
</p>

</div>




<div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

<h3 className="font-bold">
📈 Scale Faster
</h3>

<p className="text-slate-400 mt-2">
Track your growth from one dashboard.
</p>

</div>


</div>



</div>


</main>

);

}