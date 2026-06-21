import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ userId: string }> },
) => {
  const { userId } = await params;
  console.log("route hit")

  try {
    const latestTestSession = await prisma.testSession.findFirst({
      where: { userId: userId },
      select: {
        id:true,
        weakTopicsStatus: true,
      },
      orderBy:{
        createdAt:"desc"
      }
    });

    if (!latestTestSession) {
      return NextResponse.json(
        { success: false, message: "latest test Session not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      {
        success: true,
        message: "latest test session fetched successfully",
        status: latestTestSession.weakTopicsStatus,
        sessionId:latestTestSession.id
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("error fetching session! ", errorMessage);
    return NextResponse.json(
      { success: false, message: "server error" },
      { status: 500 },
    );
  }
};
