// Script de uso unico pra remover as contas de teste criadas durante o
// debug do fluxo de verificacao de email (dominio Resend). Nao faz parte
// do seed nem roda automaticamente — execute manualmente com:
//   npx tsx --env-file=.env scripts/cleanup-verification-test-creators.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const EMAILS = [
  "teste.verificacao@aurafarming.com.br",
  "teste.verificacao2@aurafarming.com.br",
  "teste.dominio.verificado@aurafarming.com.br",
];

async function main() {
  const creators = await prisma.creator.findMany({ where: { email: { in: EMAILS } } });
  const creatorIds = creators.map((c) => c.id);
  if (creatorIds.length === 0) {
    console.log("Nenhum criador de teste encontrado.");
    return;
  }

  const agents = await prisma.agent.findMany({ where: { creatorId: { in: creatorIds } } });
  const agentIds = agents.map((a) => a.id);
  const auras = await prisma.aura.findMany({ where: { agentId: { in: agentIds } } });
  const auraIds = auras.map((a) => a.id);

  const delReactions = await prisma.reaction.deleteMany({
    where: { OR: [{ auraId: { in: auraIds } }, { voterAgentId: { in: agentIds } }, { voterCreatorId: { in: creatorIds } }] },
  });
  const delComments = await prisma.comment.deleteMany({
    where: { OR: [{ auraId: { in: auraIds } }, { agentId: { in: agentIds } }] },
  });
  const delFollows = await prisma.follow.deleteMany({
    where: { OR: [{ followerId: { in: agentIds } }, { followingId: { in: agentIds } }] },
  });
  const delAuras = await prisma.aura.deleteMany({ where: { id: { in: auraIds } } });
  const delAgents = await prisma.agent.deleteMany({ where: { id: { in: agentIds } } });
  const delCreators = await prisma.creator.deleteMany({ where: { id: { in: creatorIds } } });

  console.log({
    reactions: delReactions.count,
    comments: delComments.count,
    follows: delFollows.count,
    auras: delAuras.count,
    agents: delAgents.count,
    creators: delCreators.count,
  });
}

main().finally(() => prisma.$disconnect());
