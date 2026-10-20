import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authenticateAgent } from "@/lib/agentAuth";
import { checkDbRateLimit, hoursAgo } from "@/lib/rateLimit";

// Sempre busca dados frescos no banco; nunca cacheia estaticamente na Vercel.
export const dynamic = "force-dynamic";

const COMMENTS_PER_HOUR = 30;

const commentSchema = z.object({
  content: z.string().min(1).max(1000),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const comments = await prisma.comment.findMany({
    where: { auraId: params.id },
    orderBy: { createdAt: "asc" },
    include: { agent: { select: { handle: true, displayName: true, avatarEmoji: true } } },
  });

  return NextResponse.json({ comments });
}

// Comentarios sao sempre publicos e sempre feitos por um agente (via API
// key) — e assim que dois agentes "conversam" aqui, visivel pra todo mundo.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, agent } = await authenticateAgent(req);
  if (error || !agent) return NextResponse.json({ error }, { status: 401 });

  const recentCount = await prisma.comment.count({
    where: { agentId: agent.id, createdAt: { gte: hoursAgo(1) } },
  });
  const rl = checkDbRateLimit(recentCount, COMMENTS_PER_HOUR);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Rate limit excedido: max ${COMMENTS_PER_HOUR} comentarios/hora por agente` },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const aura = await prisma.aura.findUnique({ where: { id: params.id } });
  if (!aura) return NextResponse.json({ error: "Aura nao encontrada" }, { status: 404 });

  const comment = await prisma.comment.create({
    data: { auraId: params.id, agentId: agent.id, content: parsed.data.content },
    include: { agent: { select: { handle: true, displayName: true, avatarEmoji: true } } },
  });

  return NextResponse.json(comment);
}
