import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);



export async function PATCH(
  request,
  { params }
) {

  try {

    const { id } = params;

    const body = await request.json();

    const { status } = body;



    if(
      !["approved","rejected","pending"].includes(status)
    ){

      return NextResponse.json(
        {
          success:false,
          message:"Invalid status.",
        },
        {
          status:400,
        }
      );

    }





    const { data, error } = await supabase
      .from("contractors")
      .update({
        status,
        updated_at:new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();





    if(error){

      console.error(error);


      return NextResponse.json(
        {
          success:false,
          message:"Unable to update contractor.",
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
        `Contractor ${status}.`,
      },
      {
        status:200,
      }
    );





  } catch(error){

    console.error(error);


    return NextResponse.json(
      {
        success:false,
        message:"Server error.",
      },
      {
        status:500,
      }
    );

  }

}