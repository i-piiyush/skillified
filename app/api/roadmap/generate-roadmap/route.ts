import { auth } from "@/lib/auth";
import { generateRoadmap } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { Roadmap } from "@/types/roadmap";
import { TopicType } from "@prisma/client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!body) {
      return NextResponse.json(
        {
          success: false,
          message: "request body can't be empty",
        },
        { status: 400 },
      );
    }

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const roadmap: Roadmap = await generateRoadmap(body);
    const dbRoadmap = await prisma.roadmap.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        estimatedMonths: roadmap.estimatedMonths,
        practicalWeight: roadmap.practicalWeight,
        dsaWeight: roadmap.dsaWeight,
        systemDesignWeight: roadmap.systemDesignWeight,
      },
      update: {
        estimatedMonths: roadmap.estimatedMonths,
        practicalWeight: roadmap.practicalWeight,
        dsaWeight: roadmap.dsaWeight,
        systemDesignWeight: roadmap.systemDesignWeight,
      },
    });

    await prisma.roadmapTopic.deleteMany({
      where: {
        roadmapId: dbRoadmap.id,
      },
    });

    const topics = [
      ...(roadmap.practicalTopics ?? []).map((topic, index) => ({
        roadmapId: dbRoadmap.id,
        type: TopicType.PRACTICAL,
        name: topic.name,
        depth: topic.depth,
        focusedHours: topic.focusedHours,
        focus: topic.focus,
        avoid: topic.avoid,
        projects: topic.projects,
      })),

      ...(roadmap.dsaTopics ?? []).map((topic, index) => ({
        roadmapId: dbRoadmap.id,
        type: TopicType.DSA,
        name: topic.name,
        depth: topic.depth,
        focusedHours: topic.focusedHours,
        focus: [],
        avoid: [],
        projects: [],
        easyQuestions: topic.totalQuestion.easy,
        mediumQuestions: topic.totalQuestion.medium,
      })),

      ...(roadmap.systemDesignTopics ?? []).map((topic, index) => ({
        roadmapId: dbRoadmap.id,
        type: TopicType.SYSTEM_DESIGN,
        name: topic.name,
        depth: topic.depth,
        focusedHours: topic.focusedHours,
        focus: topic.focus,
        avoid: topic.avoid,
        projects: [],
      })),
    ];

    if (topics.length > 0) {
      await prisma.roadmapTopic.createMany({
        data: topics,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "roadmap generated successfully",
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("error generating roadmap:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        message: "server error",
      },
      { status: 500 },
    );
  }
};