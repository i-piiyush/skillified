import { NextResponse } from "next/server";
import { fetchTest } from "@/lib/groq";
import { prisma } from "@/lib/prisma";

export const POST = async (req: Request) => {
  const body = await req.json();
  const { domain, email, stack, role, userId } = body;

  if (!domain || !email || !stack || !role || !userId) {
    return NextResponse.json(
      {
        message: "Name, domain, email, role or stack can't be empty",
        success: false,
      },
      { status: 400 },
    );
  }

  const updatedStack = stack.split(" + ");
  console.log("updated stack:", updatedStack);

  try {
    // 🔥 FIX 1: Find Unique check hataya. Seedha existing user ko update kiya.
    // Agar user nahi mila (frontend ne pehle banaya nahi), toh catch block mein P2025 error aayega.
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        domain: domain,
        stack: updatedStack,
        role: role,
        level: 1,
        userOnboarded:true
        
      },
    });

    // 🔥 FIX 2: Test generation logic ko bahar nikal diya taaki hamesha chale
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
          userId: updatedUser.id, // 🔥 updatedUser ki ID use ki
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
    console.log("error creating user or generating test ", error);
    
    // Agar by chance user database mein nahi mila
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        {
          message: "User not found. Please register first.",
          success: false,
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Server Error",
        success: false,
      },
      { status: 500 },
    );
  }
};