import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;


if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}


const supabase = createClient(
  supabaseUrl,
  supabaseKey
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



    // Validate required fields

    if (
      !companyName ||
      !ownerName ||
      !email ||
      !phone
    ) {

      return NextResponse.json(
        {
          success:false,
          message:"Please complete all required fields.",
        },
        {
          status:400,
        }
      );

    }




    // Check existing contractor

    const { data: existing } = await supabase
      .from("contractors")
      .select("id")
      .eq("email", email)
      .single();



    if(existing){

      return NextResponse.json(
        {
          success:false,
          message:"An application already exists for this email.",
        },
        {
          status:409,
        }
      );

    }





    // Create contractor application

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

          created_at:new Date().toISOString(),

        },
      ])
      .select()
      .single();





    if(error){

      console.error(
        "Supabase error:",
        error
      );


      return NextResponse.json(
        {
          success:false,
          message:"Unable to save application.",
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
        "Application submitted successfully.",

      },
      {
        status:201,
      }
    );





  } catch(error){


    console.error(
      "Apply API Error:",
      error
    );


    return NextResponse.json(
      {
        success:false,
        message:"Internal server error.",
      },
      {
        status:500,
      }
    );


  }

}