import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const body = await req.json();
  const { questionId, correctAnswer, sessionId } = body;

  if (!questionId || !correctAnswer || !sessionId) {
    return NextResponse.json(
      {
        success: false,
        message: "question,session or correct question can't be empty",
      },
      { status: 400 },
    );
  }

  try {
    const existingSession = await prisma.testSession.findUnique({
      where: { id: sessionId },
    });

    if (!existingSession || existingSession.status === "completed") {
      return NextResponse.json(
        {
          message: "invalid session",
          success: false,
        },
        { status: 400 },
      );
    }

    const question = await prisma.question.findUnique({
      where: {
        id: questionId,
      },
    });

    if (!question)
      return NextResponse.json(
        {
          message: "invalid question",
          success: false,
        },
        { status: 400 },
      );

    const isCorrect =
      question.correctAnswer.trim().toLowerCase() ===
      correctAnswer.trim().toLowerCase();

    let points = 0;
    if (isCorrect) {
      if (question.level === 0) {
        points = 1;
      } else if (question.level === 1) {
        points = 2;
      } else {
        points = 3;
      }
    }

    const nextDiff = correctAnswer
      ? Math.min(2, existingSession.currentDiff + 1)
      : Math.max(0, existingSession.currentDiff - 1);

    const newTotal = existingSession.totalAnswered + 1;
    const newAnsweredIds = [...existingSession.answeredIds, questionId];
    const isComplete = newTotal >= 10;

    await prisma.testAnswer.create({
      data: {
        sessionId,
        questionId,
        userAnswer:correctAnswer,
        isCorrect,
        difficulty: existingSession.currentDiff,
        points,
      },
    });

    // Update session
    await prisma.testSession.update({
      where: { id: sessionId },
      data: {
        score: existingSession.score + points,
        currentDiff: nextDiff,
        totalAnswered: newTotal,
        answeredIds: newAnsweredIds,
        status: isComplete ? "completed" : "in_progress",
      },
    });

    // If test complete — no next question
  if (isComplete) {
    return Response.json({
      correct: isCorrect,
      correctAnswer: question!.correctAnswer,
      points,
      score: existingSession.score + points,
      progress: { current: 10, total: 10 },
      isComplete: true,
      nextQuestion: null,
    });
  }

  // Pick next question based on new difficulty
  const nextQuestion = await prisma.question.findFirst({
    where: {
      domain: existingSession.domain,
      role: existingSession.role,
      level: nextDiff,
      id: { notIn: newAnsweredIds },  // never repeat
    },
    select: {
      id: true,
      text: true,
      code: true,
      type: true,
      options: true,
      skillId: true,
      level: true,
      // correctAnswer NOT included
    }
  });

  // Fallback: if no question at nextDiff, try any difficulty
  const finalNextQuestion = nextQuestion ?? await prisma.question.findFirst({
    where: {
      domain: existingSession.domain,
      role: existingSession.role,
      id: { notIn: newAnsweredIds },
    },
    select: {
      id: true,
      text: true,
      code: true,
      type: true,
      options: true,
      skillId: true,
      level: true,
    }
  });

  return Response.json({
    correct: isCorrect,
    correctAnswer: question!.correctAnswer,  // safe — they already answered
    points,
    score: existingSession.score + points,
    progress: { current: newTotal + 1, total: 10 },
    isComplete: false,
    nextQuestion: finalNextQuestion,
  });

  } catch (error) {
    console.log("error checking answer...", error);
    return NextResponse.json(
      {
        message: "Server Error",
        success: false,
      },
      { status: 500 },
    );
  }
};
