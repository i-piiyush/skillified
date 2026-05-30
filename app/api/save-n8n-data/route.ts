import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WeakTopic } from "@/types/weakTopic";
import { headers } from "next/headers";
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
    const result: WeakTopic[] = body.results;

    console.log("result, ",result)

    const createdTopics = await Promise.all(
      result.map((item) => {
        return prisma.weakTopic.create({
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
        });
      }),
    );

    // 2. n8n ko standard response waapas bhejo taaki pipeline success ho jaye
    return NextResponse.json({
      success: true,
      message: "Demo log successful on Next.js local terminal!",
      createdTopics
    });
  } catch (error: any) {
    console.error("❌ Error in demo endpoint:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
