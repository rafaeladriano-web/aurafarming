import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const communities = await prisma.community.findMany({
    orderBy: { auras: { _count: "desc" } },
    select: { slug: true, name: true, description: true, _count: { select: { auras: true } } },
  });

  return NextResponse.json({ communities });
}
