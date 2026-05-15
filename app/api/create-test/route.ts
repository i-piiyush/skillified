import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const body = await req.json();
  const { userId } = body;

  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        message: "user id can't be empty",
      },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "user not found",
        },
        { status: 404 },
      );
    }
    const session = await prisma.testSession.create({
      data: {
        userId: user.id,
        stack: user.stack,
        domain: user.domain,
        role: user.role,
        currentDiff: 1,
      },
    });

    const count = await prisma.question.count({
      where: {
        domain: user.domain,
        role: user.role,
        level: 1,
      },
    });

    const question = await prisma.question.findFirst({
      where: { domain: user.domain, role: user.role, level: 1 },
      skip: Math.floor(Math.random() * count),
      select: {
        id: true,
        text: true,
        code: true,
        type: true,
        options: true,
        skillId: true,
        level: true,
      },
    });

    return NextResponse.json(
      {
        message: "session created",
        sessionId: session.id,
        question: question,
        success: true,
        progress: { current: 1, total: 10 },
        user: user,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log("error starting test... ", error);
    return NextResponse.json(
      {
        message: "Server Error",
        success: false,
      },
      { status: 500 },
    );
  }
};
