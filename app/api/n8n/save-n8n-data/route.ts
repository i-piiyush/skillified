
import { prisma } from "@/lib/prisma";
import { WeakTopic } from "@/types/weakTopic";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const authHeader = request.headers.get("x-n8n-api-key");
  const secretKey = process.env.N8N_WEBHOOK_SECRET;
  if (authHeader !== secretKey) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Please log in." },
      { status: 401 },
    );
  }

  try {
    // 1. n8n se aane wale pure json payload ko catch karo
    const body = await request.json();
    const userId: string = body.user_id;
    const testSessionId = body.session_id
    const result: WeakTopic[] = body.results;

    console.log("result ", result)

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }



    const newlyCreatedTopics = await prisma.$transaction(async (tx:unknown) => {
      await tx.weakTopic.deleteMany({
        where: {
          userId: userId,
        },
      });

      const createdTopics = await Promise.all(
        result.map((item) => {
          return tx.weakTopic.create({
            data: {
              topic: item.topic,
              userId: userId,
              whyYouNeedToStudyThis: item.whyYouNeedToStudyThis,
              topResource: {
                create: {
                  type: item.topResource.type,
                  title: item.topResource.title,
                  url: item.topResource.url,
                  source: item.topResource.source,
                  whyChosen: item.topResource.whyChosen,
                },
              },
            },
            include: {
              topResource: true,
            },
          });
        }),
      );

      return createdTopics;
    });

    await prisma.testSession.update({
      where:{
        id:testSessionId
      },
      data:{
        weakTopicsStatus:"COMPLETED"
      }
    })

    
    return NextResponse.json(
      {
        success: true,
        message: "weak topics fetched successfully",
        newlyCreatedTopics,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error while fetching weak topics", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
