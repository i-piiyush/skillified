import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { fetchStack, fetchTest } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

export const POST = async (req: Request) => {
  const body = await req.json();
  const { name, domain } = body;

  if (!name || !domain) {
    return NextResponse.json(
      {
        message: "Name and domain can't be empty",
        success: false,
      },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        name: name,
      },
    });

    if (!user) {
      const newUser = await prisma.user.create({
        data: {
          name: name,
          domain: domain,
          stack: ["Next.js", "React", "Tailwind CSS"], // Must be an array of strings
          email: "piyush@example.com", // Now optional, you can omit this line entirely
        },
      });

      return NextResponse.json(
        {
          message: "user created",
          success: true,
          user: newUser,
        },
        { status: 201 },
      );
    }

    return NextResponse.json(
      {
        message: "user fetched",
        success: true,
        user: user,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log("error starting test... ", error);
    return NextResponse.json(
      {
        message: "Server Error",
        success: false,
      },
      { status: 500 },
    );
  }
};
