import { fetchStack } from "@/lib/gemini";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const body = await req.json();
  const { domain } = body;

  if (!domain) {
    return NextResponse.json(
      {
        message: "domain can't be empty",
        success: false,
      },
      { status: 400 },
    );
  }

  try {
    const stack = await fetchStack(domain);

    return NextResponse.json(
      {
        message: "Stack fetched",
        success: stack.stack.length > 0 ? true : false,
        stack: stack.stack.length > 0 ? stack.stack : null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log("error fetching stack ", error);
    return NextResponse.json(
      {
        message: "Server Error",
        success: false,
      },
      { status: 500 },
    );
  }
};
