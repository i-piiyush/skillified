import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async (_req: Request, { params }: { params: Promise<{ userId: string }> }) => {

  const {userId} = await params;
  console.log("route hit")

  
  try {
    const roadmap = await prisma.roadmap.findUnique({
      where: { userId: userId },
     include:{topics:true}
    });

    if (!roadmap) {
      return NextResponse.json(
        { success: false, message: "Roadmap not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { success: true, message: "roadmap fetched successfully", roadmap},
      { status: 200 },
    );
  } catch (error: any) {
    console.log("error fetching user! ", error.message);
    return NextResponse.json(
      { success: false, message: "server error" },
      { status: 500 },
    );
  }
};
