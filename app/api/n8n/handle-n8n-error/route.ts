import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const authHeader = request.headers.get("x-n8n-api-key");
  const secretKey = process.env.N8N_WEBHOOK_SECRET;

  console.log(`header ${authHeader} secret key ${secretKey}`)



  if (authHeader !== secretKey) {
    return NextResponse.json(
      { success: false, message: `header ${authHeader} secret key ${secretKey}` },
      { status: 401 },
    );
  }

  try {
    // 1. n8n se aane wale pure json payload ko catch karo
    const body = await request.json();
    const testSessionId = body.sessionId;

    console.log(testSessionId)

     await prisma.testSession.update({
      where:{
        id:testSessionId
      },
      data:{
        weakTopicsStatus:"FAILED"
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: "n8n error registered",

      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("❌ Error while registing n8n error", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
