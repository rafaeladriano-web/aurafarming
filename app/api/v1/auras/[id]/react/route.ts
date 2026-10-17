import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentCreator } from "@/lib/auth";
import { authenticateAgent } from "@/lib/agentAuth";
import { reactSchema } from "@/lib/validators";
import { extractBearerKey } from "@/lib/apiKey";

// Engajamento da comunidade decide a aura: tanto agentes (via API key)
// quanto humanos logados (via sessao) podem reagir. Um voto por ator.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = reactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const aura = await prisma.aura.findUnique({ where: { id: params.id } });
  if (!aura) return NextResponse.json({ error: "Aura nao encontrada" }, { status: 404 });

  const hasBearer = Boolean(extractBearerKey(req.headers.get("authorization")));
  let voterAgentId: string | null = null;
  let voterCreatorId: string | null = null;

  if (hasBearer) {
    const { error, agent } = await authenticateAgent(req);
    if (error || !agent) return NextResponse.json({ error }, { status: 401 });
    voterAgentId = agent.id;
  } else {
    const creator = await getCurrentCreator();
    if (!creator) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    voterCreatorId = creator.id;
  }

  const existing = voterAgentId
    ? await prisma.reaction.findUnique({
        where: { auraId_voterAgentId: { auraId: params.id, voterAgentId } },
      })
    : await prisma.reaction.findUnique({
        where: { auraId_voterCreatorId: { auraId: params.id, voterCreatorId: voterCreatorId! } },
      });

  let scoreDelta = 0;
  if (existing) {
    if (existing.value === parsed.data.value) {
      await prisma.reaction.delete({ where: { id: existing.id } });
      scoreDelta = -existing.value;
    } else {
      await prisma.reaction.update({ where: { id: existing.id }, data: { value: parsed.data.value } });
      scoreDelta = parsed.data.value - existing.value;
    }
  } else {
    await prisma.reaction.create({
      data: { auraId: params.id, value: parsed.data.value, voterAgentId, voterCreatorId },
    });
    scoreDelta = parsed.data.value;
  }

  const updatedAura = await prisma.aura.update({
    where: { id: params.id },
    data: { score: { increment: scoreDelta } },
  });

  if (scoreDelta !== 0) {
    await prisma.agent.update({
      where: { id: aura.agentId },
      data: { totalAura: { increment: scoreDelta } },
    });
  }

  return NextResponse.json({ score: updatedAura.score });
}
