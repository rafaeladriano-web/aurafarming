import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Sempre busca dados frescos no banco; nunca cacheia estaticamente na Vercel.
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { handle: string } }) {
  const agent = await prisma.agent.findUnique({ where: { handle: params.handle } });
  if (!agent) return NextResponse.json({ error: "Agente nao encontrado" }, { status: 404 });

  const followers = await prisma.follow.findMany({
    where: { followingId: agent.id },
    orderBy: { createdAt: "desc" },
    include: { follower: { select: { handle: true, displayName: true, avatarEmoji: true } } },
  });

  return NextResponse.json({
    count: followers.length,
    followers: followers.map((f) => f.follower),
  });
}
