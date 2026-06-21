import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Please log in." },
      { status: 401 },
    );
  }
  const userId = session.user.id;
  console.log("user id", userId);

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
        domain: user.domain || "",
        role: user.role || "",
        currentDiff: 1,
      },
    });

    console.log("session created: ", session.id)

    const count = await prisma.question.count({
      where: {
        domain: user.domain || "",
        role: user.role || "",
        level: 1,
      },
    });

    const question = await prisma.question.findFirst({
      where: { domain: user.domain || "", role: user.role || "", level: 1 },
      skip: Math.floor(Math.random() * count),
      select: {
        id: true,
        text: true,
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    console.log("error starting test... ", message);
    return NextResponse.json(
      {
        message: "Server Error",
        success: false,
      },
      { status: 500 },
    );
  }
};
