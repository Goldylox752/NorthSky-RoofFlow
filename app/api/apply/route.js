import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);



export async function POST(request) {

  try {

    const body = await request.json();


    const {
      companyName,
      ownerName,
      email,
      phone,
      serviceArea,
      yearsBusiness,
      monthlyJobs,
      averageJobValue,
      leadSource,
    } = body;



    if (
      !companyName ||
      !ownerName ||
      !email ||
      !phone
    ) {

      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        {
          status:400,
        }
      );

    }



    const { data, error } = await supabase
      .from("contractors")
      .insert([
        {
          company_name: companyName,
          owner_name: ownerName,
          email,
          phone,
          service_area: serviceArea,
          years_business: yearsBusiness,
          monthly_jobs: monthlyJobs,
          average_job_value: averageJobValue,
          lead_source: leadSource,
          status:"pending",
        },
      ])
      .select()
      .single();



    if(error){

      console.error(error);

      return NextResponse.json(
        {
          error:"Database error",
        },
        {
          status:500,
        }
      );

    }



    return NextResponse.json(
      {
        success:true,
        contractor:data,
        message:
        "Application submitted successfully",
      },
      {
        status:200,
      }
    );



  } catch(error){

    console.error(error);


    return NextResponse.json(
      {
        error:"Server error",
      },
      {
        status:500,
      }
    );

  }

}