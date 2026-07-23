export const metadata = {
  title: "Apply to RoofFlow | Join the Contractor Network",
  description:
    "Apply to join RoofFlow and access qualified roofing opportunities, AI sales automation, and contractor growth tools.",
};


export default function ApplyPage() {

return (

<main className="min-h-screen bg-slate-950 text-white">


<div className="max-w-4xl mx-auto px-8 py-20">



{/* Header */}

<div className="text-center mb-12">


<p className="text-blue-400 font-semibold uppercase tracking-wide">
RoofFlow Contractor Network
</p>


<h1 className="text-5xl font-bold mt-4">
Get More Roofing Jobs Without More Marketing Headaches
</h1>


<p className="text-slate-400 text-lg mt-5">

Apply to join RoofFlow and receive qualified homeowner opportunities,
AI-powered follow-ups, and a complete roofing growth system.

</p>


</div>






{/* Application */}

<form className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">



<div className="grid md:grid-cols-2 gap-6">


<div>

<label className="text-sm text-slate-400">
Company Name
</label>

<input
className="w-full mt-2 bg-slate-800 rounded-lg p-3"
placeholder="ABC Roofing"
/>

</div>



<div>

<label className="text-sm text-slate-400">
Owner / Contact Name
</label>

<input
className="w-full mt-2 bg-slate-800 rounded-lg p-3"
placeholder="John Smith"
/>

</div>


</div>





<div className="grid md:grid-cols-2 gap-6">


<div>

<label className="text-sm text-slate-400">
Business Email
</label>

<input
type="email"
className="w-full mt-2 bg-slate-800 rounded-lg p-3"
placeholder="company@email.com"
/>

</div>




<div>

<label className="text-sm text-slate-400">
Phone Number
</label>

<input
className="w-full mt-2 bg-slate-800 rounded-lg p-3"
placeholder="(555) 555-5555"
/>

</div>


</div>







<div>

<label className="text-sm text-slate-400">
Primary Service Area
</label>


<input
className="w-full mt-2 bg-slate-800 rounded-lg p-3"
placeholder="Edmonton, Alberta"
/>


</div>







<div className="grid md:grid-cols-2 gap-6">


<div>

<label className="text-sm text-slate-400">
Years In Business
</label>


<select className="w-full mt-2 bg-slate-800 rounded-lg p-3">

<option>
Less than 1 year
</option>

<option>
1-5 years
</option>

<option>
5-10 years
</option>

<option>
10+ years
</option>

</select>


</div>





<div>

<label className="text-sm text-slate-400">
Monthly Roofing Jobs
</label>


<select className="w-full mt-2 bg-slate-800 rounded-lg p-3">

<option>
1-5 jobs
</option>

<option>
5-15 jobs
</option>

<option>
15-50 jobs
</option>

<option>
50+ jobs
</option>


</select>


</div>


</div>









<div>

<label className="text-sm text-slate-400">
Average Roofing Project Value
</label>


<select className="w-full mt-2 bg-slate-800 rounded-lg p-3">

<option>
Under $5,000
</option>

<option>
$5,000-$15,000
</option>

<option>
$15,000-$30,000
</option>

<option>
$30,000+
</option>


</select>


</div>








<div>

<label className="text-sm text-slate-400">
Current Lead Sources
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
Social Media
</option>

<option>
Door Knocking
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

Apply To Join RoofFlow

</button>


<p className="text-center text-sm text-slate-500">
Applications are reviewed before contractor approval.
</p>


</form>









{/* Benefits */}

<div className="grid md:grid-cols-3 gap-5 mt-10">


<div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

<h3 className="font-bold text-lg">
🏠 Qualified Homeowners
</h3>

<p className="text-slate-400 mt-2">
Connect with customers actively looking for roofing services.
</p>

</div>





<div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

<h3 className="font-bold text-lg">
🤖 AI Sales Automation
</h3>

<p className="text-slate-400 mt-2">
Instantly respond, qualify, and schedule more inspections.
</p>

</div>





<div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

<h3 className="font-bold text-lg">
📈 Contractor Growth
</h3>

<p className="text-slate-400 mt-2">
Manage leads, jobs, and revenue from one platform.
</p>

</div>


</div>



</div>


</main>

);

}