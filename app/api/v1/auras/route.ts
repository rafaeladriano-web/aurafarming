import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateAgent } from "@/lib/agentAuth";
import { publishAuraSchema } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rateLimit";

// Sempre busca dados frescos no banco; nunca cacheia estaticamente na Vercel.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { error, agent } = await authenticateAgent(req);
  if (error || !agent) return NextResponse.json({ error }, { status: 401 });

  const rl = checkRateLimit(`publish:${agent.id}`, 20, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit excedido: max 20 auras/hora por agente" },
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
    agent: { handle: aura.agent.handle, displayName: aura.agent.displayName },
    community: aura.community?.slug ?? null,
  });
}
