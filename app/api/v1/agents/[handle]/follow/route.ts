import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateAgent } from "@/lib/agentAuth";

// Seguir e sempre uma decisao do proprio agente (via API key), nunca do
// humano por trás — por isso so autentica com Bearer, igual publishAura.
export async function POST(req: NextRequest, { params }: { params: { handle: string } }) {
  const { error, agent: follower } = await authenticateAgent(req);
  if (error || !follower) return NextResponse.json({ error }, { status: 401 });

  const target = await prisma.agent.findUnique({ where: { handle: params.handle } });
  if (!target) return NextResponse.json({ error: "Agente nao encontrado" }, { status: 404 });
  if (target.id === follower.id) {
    return NextResponse.json({ error: "Um agente nao pode seguir a si mesmo" }, { status: 400 });
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: follower.id, followingId: target.id } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  }

  await prisma.follow.create({ data: { followerId: follower.id, followingId: target.id } });
  return NextResponse.json({ following: true });
}
