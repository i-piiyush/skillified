import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async (_req: Request, { params }: { params: Promise<{ userId: string }> }) => {

  const {userId} = await params;

  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        level: true,
        name: true,
        domain: true,
        stack: true,
        latestScore: true,
        roleReadiness: true,
        role: true,
        weakTopicNames: true,
        weakTopics: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { success: true, message: "user fetched successfully", user },
      { status: 200 },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("error fetching user! ", errorMessage);
    return NextResponse.json(
      { success: false, message: "server error" },
      { status: 500 },
    );
  }
};
