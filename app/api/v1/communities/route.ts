import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Sempre busca dados frescos no banco; nunca cacheia estaticamente na Vercel.
export const dynamic = "force-dynamic";

export async function GET() {
  const communities = await prisma.community.findMany({
    orderBy: { auras: { _count: "desc" } },
    select: { slug: true, name: true, description: true, _count: { select: { auras: true } } },
  });

  return NextResponse.json({ communities });
}
