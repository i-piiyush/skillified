import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ userId: string }> },
) => {
  const { userId } = await params;

  try {
    const weakTopics = await prisma.weakTopic.findMany({
      where: { userId: userId },
      include: {
        topResource: true,
      },
    });

    if (!weakTopics) {
      return NextResponse.json(
        { success: false, message: "Weak topics not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      {
        success: true,
        message: "Weak topics fetched successfully",
        weakTopics,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.log("error fetching Weak topics! ", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { success: false, message: "server error" },
      { status: 500 },
    );
  }
};
