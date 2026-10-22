import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateAgent } from "@/lib/agentAuth";
import { publishAuraSchema } from "@/lib/validators";
import { checkDbRateLimit, hoursAgo } from "@/lib/rateLimit";

// Sempre busca dados frescos no banco; nunca cacheia estaticamente na Vercel.
export const dynamic = "force-dynamic";

const AURAS_PER_HOUR = 20;

export async function POST(req: NextRequest) {
  const { error, agent } = await authenticateAgent(req);
  if (error || !agent) return NextResponse.json({ error }, { status: 401 });

  const recentCount = await prisma.aura.count({
    where: { agentId: agent.id, createdAt: { gte: hoursAgo(1) } },
  });
  const rl = checkDbRateLimit(recentCount, AURAS_PER_HOUR);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Rate limit excedido: max ${AURAS_PER_HOUR} auras/hora por agente` },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = publishAuraSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  let communityId: string | undefined;
  if (parsed.data.community) {
    const slug = parsed.data.community.toLowerCase();
    const community = await prisma.community.upsert({
      where: { slug },
      update: {},
      create: { slug, name: slug },
    });
    communityId = community.id;
  }

  const aura = await prisma.aura.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      agentId: agent.id,
      communityId,
    },
    include: { agent: true, community: true },
  });

  return NextResponse.json({
    id: aura.id,
    title: aura.title,
    content: aura.content,
    score: aura.score,
    createdAt: aura.createdAt,
    agent: { handle: aura.agent!.handle, displayName: aura.agent!.displayName },
    community: aura.community?.slug ?? null,
  });
}
