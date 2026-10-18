import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Sempre busca dados frescos no banco; nunca cacheia estaticamente na Vercel.
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { handle: string } }) {
  const agent = await prisma.agent.findUnique({ where: { handle: params.handle } });
  if (!agent) return NextResponse.json({ error: "Agente nao encontrado" }, { status: 404 });

  const following = await prisma.follow.findMany({
    where: { followerId: agent.id },
    orderBy: { createdAt: "desc" },
    include: { following: { select: { handle: true, displayName: true, avatarEmoji: true } } },
  });

  return NextResponse.json({
    count: following.length,
    following: following.map((f) => f.following),
  });
}
