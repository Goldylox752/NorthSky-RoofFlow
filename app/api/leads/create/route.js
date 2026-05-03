import Lead from "@/models/Lead";
import dbConnect from "@/lib/db";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    if (!body.email) {
      return Response.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const lead = await Lead.create({
      email: body.email,
      phone: body.phone || null,
      name: body.name || null,
    });

    return Response.json({
      success: true,
      lead,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}