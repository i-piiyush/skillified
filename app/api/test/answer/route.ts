import { analyseResult } from "@/lib/analyses/analyseResult";
import { getWeakTopics } from "@/lib/analyses/getWeakTopics";
import { Role, ROLE_CRITERIA } from "@/lib/analyses/roleCriteria";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const body = await req.json();
  const { questionId, userAnswer, sessionId } = body;

  console.log(
    `question id ${questionId} correct answer ${userAnswer} session id ${sessionId}`,
  );

  if (!questionId || !userAnswer || !sessionId) {
    return NextResponse.json(
      {
        success: false,
        message: "question, session or correct question can't be empty",
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
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        {
          message: "invalid question",
          success: false,
        },
        { status: 400 },
      );
    }
    const normalize = (s: string) =>
      s
        .trim()
        .toLowerCase()
        .replace(/\\n/g, " ")
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ");

    const isCorrect =
      normalize(question.correctAnswer) === normalize(userAnswer);

    console.log(
      "normalized correct answer  ",
      normalize(question.correctAnswer),
    );

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

    const nextDiff = isCorrect
      ? Math.min(2, existingSession.currentDiff + 1)
      : Math.max(0, existingSession.currentDiff - 1);

    const newTotal = existingSession.totalAnswered + 1;
    const newAnsweredIds = [...existingSession.answeredIds, questionId];
    const isComplete = newTotal >= 10;

    await prisma.testAnswer.create({
      data: {
        sessionId,
        questionId,
        userAnswer: userAnswer,
        isCorrect,
        difficulty: existingSession.currentDiff,
        points,
      },
    });

    console.log({ nextDiff, isCorrect, correctAnswer: question.correctAnswer });

    const finalScore = existingSession.score + points;
    // Update session
    await prisma.testSession.update({
      where: { id: sessionId },
      data: {
        score: finalScore,
        currentDiff: nextDiff,
        totalAnswered: newTotal,
        answeredIds: newAnsweredIds,
        status: isComplete ? "completed" : "in_progress",
      },
    });

    // If test complete — no next question
    if (isComplete) {
      const maxScore = 30;
      const percentage = Math.round((finalScore / maxScore) * 100);

      const allAnswers = await prisma.testAnswer.findMany({
        where: { sessionId },
        include: { question: { select: { skillId: true } } },
      });

      const answerForAnalyses = allAnswers.map((a) => ({
        isCorrect: a.isCorrect,
        difficulty: a.difficulty,
        skillId: a.question.skillId,
      }));

      const weakTopics = getWeakTopics(answerForAnalyses);
      const analysis = analyseResult(
        percentage,
        existingSession.role as Role,
        weakTopics,
      );

      

      await prisma.user.update({
        where: { id: existingSession.userId },
        data: {
          latestScore: percentage,
          weakTopics: analysis.weakTopics,
          roleReadiness: analysis.roleReadiness,
          lastTested: new Date(),
        },
      });

      return NextResponse.json({
        correct: isCorrect,
        correctAnswer: question.correctAnswer,
        points,
        score: finalScore,
        isComplete: true,
        nextQuestion: null,
        analysis,
      });
    }

    const targetWhere = {
      domain: existingSession.domain,
      role: existingSession.role,
      level: nextDiff,
      id: { notIn: newAnsweredIds },
    };

    const targetCount = await prisma.question.count({ where: targetWhere });

    let finalNextQuestion = null;

    if (targetCount > 0) {
      const randomSkip = Math.floor(Math.random() * targetCount);

      finalNextQuestion = await prisma.question.findFirst({
        where: targetWhere,
        skip: randomSkip,
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
    }

    // 5. Fallback: if no question at nextDiff, grab a random one from ANY difficulty
    if (!finalNextQuestion) {
      const fallbackWhere = {
        domain: existingSession.domain,
        role: existingSession.role,
        id: { notIn: newAnsweredIds },
      };

      const fallbackCount = await prisma.question.count({
        where: fallbackWhere,
      });

      if (fallbackCount > 0) {
        const fallbackSkip = Math.floor(Math.random() * fallbackCount);

        finalNextQuestion = await prisma.question.findFirst({
          where: fallbackWhere,
          skip: fallbackSkip,
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
      }
    }

    return NextResponse.json({
      correct: isCorrect,
      correctAnswer: question.correctAnswer,
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
