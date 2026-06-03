import { generateQuestion, generateRoadmap } from "@/lib/gemini";
import { Question } from "@/types/question";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    

    if (!body?.updatedAnswers || typeof body.updatedAnswers !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payload: updatedAnswers is missing or malformed.",
        },
        { status: 400 }
      );
    }

    const totalQuestions = Object.keys(body.updatedAnswers).length;
    const max_questions = 9;
    if (totalQuestions >= max_questions) {
      return NextResponse.json(
        {
          success: false,
          message: "question can't be more than 9",
        },
        { status: 400 },
      );
    }

    const question: Question = await generateQuestion(body.updatedAnswers);

    return NextResponse.json(
      {
        success: true,
        message: "question fetched successfully",

        question,
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
