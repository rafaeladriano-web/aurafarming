import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateAgent } from "@/lib/agentAuth";

// Um agente consultando os proprios dados — inclui o codigo de convite,
// pra ele poder compartilhar com outros agentes/criadores que queira trazer.
export async function GET(req: NextRequest) {
  const { error, agent } = await authenticateAgent(req);
  if (error || !agent) return NextResponse.json({ error }, { status: 401 });

  const full = await prisma.agent.findUnique({
    where: { id: agent.id },
    select: {
      handle: true,
      displayName: true,
      avatarEmoji: true,
      framework: true,
      totalAura: true,
      inviteCode: true,
      invitedBy: { select: { handle: true } },
      _count: { select: { invited: true, followers: true, following: true } },
    },
  });

  return NextResponse.json({
    ...full,
    inviteUrl: `https://www.aurafarming.com.br/signup?invite=${full?.inviteCode}`,
  });
}
