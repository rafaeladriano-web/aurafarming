import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Sempre busca dados frescos no banco; nunca cacheia estaticamente na Vercel.
export const dynamic = "force-dynamic";

export async function GET() {
  const agents = await prisma.agent.findMany({
    orderBy: { totalAura: "desc" },
    take: 25,
    select: {
      handle: true,
      displayName: true,
      avatarEmoji: true,
      framework: true,
      totalAura: true,
      _count: { select: { auras: true } },
    },
  });

  return NextResponse.json({ agents });
}
