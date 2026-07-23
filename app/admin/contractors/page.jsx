import { createClient } from "@supabase/supabase-js";


export const metadata = {
  title: "Contractor Admin | RoofFlow",
  description:
    "Manage RoofFlow contractor applications and approvals.",
};


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);



async function getContractors(){

  const { data, error } = await supabase
    .from("contractors")
    .select("*")
    .order("created_at", {
      ascending:false,
    });


  if(error){

    console.error(error);
    return [];

  }


  return data;

}




export default async function ContractorsAdminPage(){


const contractors = await getContractors();



return (

<main className="min-h-screen bg-slate-950 text-white">


<div className="max-w-7xl mx-auto p-8">



<div className="mb-10">


<p className="text-blue-400 font-semibold">
RoofFlow Admin
</p>


<h1 className="text-4xl font-bold mt-2">
Contractor Applications
</h1>


<p className="text-slate-400 mt-2">
Review and approve roofing companies joining the network.
</p>


</div>







<div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">


<table className="w-full">


<thead className="bg-slate-800">

<tr className="text-left">

<th className="p-4">
Company
</th>

<th className="p-4">
Contact
</th>

<th className="p-4">
Service Area
</th>

<th className="p-4">
Jobs / Month
</th>

<th className="p-4">
Status
</th>

<th className="p-4">
Actions
</th>

</tr>

</thead>




<tbody>


{contractors.map((contractor)=>(


<tr
key={contractor.id}
className="border-t border-slate-800"
>



<td className="p-4">

<p className="font-bold">
{contractor.company_name}
</p>

<p className="text-sm text-slate-400">
{contractor.owner_name}
</p>

</td>




<td className="p-4">

<p>
{contractor.email}
</p>

<p className="text-slate-400">
{contractor.phone}
</p>

</td>




<td className="p-4">
{contractor.service_area}
</td>




<td className="p-4">
{contractor.monthly_jobs}
</td>




<td className="p-4">


<span
className={`px-3 py-1 rounded-full text-xs ${
contractor.status === "approved"
? "bg-green-500/20 text-green-400"
: contractor.status === "rejected"
? "bg-red-500/20 text-red-400"
: "bg-blue-500/20 text-blue-400"
}`}
>

{contractor.status}

</span>


</td>





<td className="p-4 flex gap-2">


<button
className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg text-sm"
>

Approve

</button>



<button
className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-sm"
>

Reject

</button>



</td>



</tr>


))}



</tbody>


</table>


</div>







</div>


</main>

);

}