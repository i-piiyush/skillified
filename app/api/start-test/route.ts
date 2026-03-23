import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { fetchTest } from "@/lib/gemini";


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
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    const user = userCookie ? JSON.parse(userCookie.value) : null;

    if (!user) {
      const newUser = {
        name: name,
        domain: domain,
        id: uuidv4(),
      };
      cookieStore.set("user", JSON.stringify(newUser), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
  
    console.log("test running!!");
    const test = await fetchTest(domain)
    console.log("fetched testtt ",test)

    return NextResponse.json(
      {
        message: "Test Generated",
        success: true,
        data:user,
        test:test
      },
      { status: 201 },
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
