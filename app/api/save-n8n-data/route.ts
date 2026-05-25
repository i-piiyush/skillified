import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. n8n se aane wale pure json payload ko catch karo
    const body = await request.json();

    console.log(body)

    // const upsertWeakTopic = prisma.weakTopic.upsert({
    //   where:{

    //   }
    // })

    // 2. n8n ko standard response waapas bhejo taaki pipeline success ho jaye
    return NextResponse.json({ 
      success: true, 
      message: "Demo log successful on Next.js local terminal!" 
    });

  } catch (error: any) {
    console.error("❌ Error in demo endpoint:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}