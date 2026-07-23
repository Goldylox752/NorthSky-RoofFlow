"use client";

import { useState } from "react";


export default function ContractorTable({ initialContractors }) {

  const [contractors, setContractors] = useState(initialContractors);


  async function updateStatus(id, status) {

    const response = await fetch(
      `/api/admin/contractors/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      }
    );


    const data = await response.json();


    if(data.success){

      setContractors((current)=>
        current.map((contractor)=>
          contractor.id === id
          ? {
              ...contractor,
              status,
            }
          : contractor
        )
      );

    }

  }



return (

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
Area
</th>

<th className="p-4">
Jobs
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
onClick={() =>
updateStatus(contractor.id,"approved")
}
className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg text-sm"
>
Approve
</button>



<button
onClick={() =>
updateStatus(contractor.id,"rejected")
}
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

);

}