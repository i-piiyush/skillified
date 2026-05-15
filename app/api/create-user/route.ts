import { NextResponse } from "next/server";
import { fetchTest } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

export const POST = async (req: Request) => {
  const body = await req.json();
  const { name, domain, email, stack, role } = body;

  if (!name || !domain || !email || !stack || !role) {
    return NextResponse.json(
      {
        message: "Name, domain, email, role or stack can't be empty",
        success: false,
      },
      { status: 400 },
    );
  }

  const updatedStack = stack.split(" + ");
  console.log("updated stack:" , updatedStack)

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      await prisma.user.create({
        data: {
          name: name,
          domain: domain,
          stack: updatedStack, // Must be an array of strings
          email: email, // Now optional, you can omit this line entirely
          role: role,
          level : 1
        },
      });
    }

    const existingTestQuestions = await prisma.question.findMany({
      where: {
        role: role,
        domain: domain,
        stack: { hasEvery: updatedStack },
      },
    });

    if (existingTestQuestions.length >= 50) {
      return NextResponse.json(
        {
          message: "existing test found",
          success: true,
          fetchedQuestions: existingTestQuestions,
          userId : user?.id
        },
        { status: 200 },
      );
    }
    const testQuestions = await fetchTest(domain, updatedStack, role);
    if (testQuestions.length < 1) {
      return NextResponse.json(
        {
          message: "Error generating test, Please try again later",
          success: false,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "New Test Questions Created",
        success: true,
        newQuestions: testQuestions,
      },
      { status: 201 },
    );
  } catch (error) {
    console.log("error creacting user or generating test ", error);
    return NextResponse.json(
      {
        message: "Server Error",
        success: false,
      },
      { status: 500 },
    );
  }
};
