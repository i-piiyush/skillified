import { generateQuestion, generateRoadmap } from "@/lib/gemini";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    console.log("body: ", body);

    const question = await generateQuestion(body);
   

    return NextResponse.json(
      {
        success: true,
        message:"question fetched successfully",
        
        question
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.log("error in genearte question api ", err.message);
    return NextResponse.json(
      {
        success: false,
        message: "server error",
      },
      { status: 500 },
    );
  }
};
