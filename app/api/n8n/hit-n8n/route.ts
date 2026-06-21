import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  let sessionIdForRollback: string | null = null;
  try {
    const body = await request.json();
    const { sessionId, user_id, stack, weakTopics, role } = body;

    console.log("body: ",body)

    if (!sessionId || !user_id) {
      return NextResponse.json(
        { success: false, message: "Missing Data" },
        { status: 400 },
      );
    }

    sessionIdForRollback = sessionId;

    // 1. Instantly Update Database to PROCESSING (Safeguards your polling)
    await prisma.testSession.update({
      where: { id: sessionId },
      data: { weakTopicsStatus: "PROCESSING" },
    });

    // 2. Safely trigger N8N from the Server
    const n8nUrl = process.env.N8N_WEBHOOK_URL;

    if (!n8nUrl) {
      throw new Error("N8N URL not configured in backend");
    }

    await axios.post(
      n8nUrl,
      {
        session_id: sessionId,
        user_id,
        stack,
        weakTopics,
        role,
      },
      {
        headers: {
          // Now your secret key is completely hidden from the browser!
          "llama-api-key": process.env.LLAMA_API_SECRET_KEY,
        },
      },
    );

    // 3. Return success to frontend
    return NextResponse.json(
      { success: true, message: "n8n trigger initiated" },
      { status: 200 },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Retry Proxy Error:", errorMessage);

    if (sessionIdForRollback) {
      await prisma.testSession
        .update({
          where: { id: sessionIdForRollback },
          data: { weakTopicsStatus: "FAILED" },
        })
        .catch((err:unknown) =>
          console.error("Database Rollback bhi fail ho gaya!", err),
        );
    }

    return NextResponse.json(
      { success: false, error: "Failed to trigger n8n" },
      { status: 500 },
    );
  }
}
