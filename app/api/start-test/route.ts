import { NextResponse } from "next/server";
import {  fetchTest } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

export const POST = async (req: Request) => {
  const body = await req.json();
  const { name, domain,email,stack,role } = body;

  if (!name || !domain || !email || !stack || !role) {
    return NextResponse.json(
      {
        message: "Name, domain, email, role or stack can't be empty",
        success: false,
      },
      { status: 400 },
    );
  }

  const updatedStack = stack.split(" + ")

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    

    if (!user) {
      await prisma.user.create({
        data: {
          name: name,
          domain: domain,
          stack: updatedStack, // Must be an array of strings
          email: email, // Now optional, you can omit this line entirely
          role:role
        },
      });

    
    }

    const testResults = await fetchTest(domain,updatedStack,role)
    if (testResults.length < 1){
      return NextResponse.json(
      {
        message: "Error generating test, Please try again later",
        success: false,
      },
      { status: 500 },
    );
    }
    

  //  testResults.forEach(async(test)=>(
  //   await prisma.question.create({
  //     data:{
  //       domain:test.domain,
  //       skillId:test.skillId,
  //       type:test.type,
  //       text:test.text,
  //       options:test.options,
  //       correctAnswer:test.correctAnswer,
  //       level:test.level
  //     }
  //   })
  //  ))

    return NextResponse.json(
      {
        message: "test fetched",
        success: true,
        testResults
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
