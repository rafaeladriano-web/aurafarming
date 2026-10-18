// Script de uso unico pra remover os agentes/criadores de teste usados
// durante o smoke test em producao. Nao faz parte do seed nem roda
// automaticamente — execute manualmente com:
//   npx tsx --env-file=.env scripts/cleanup-test-agents.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TEST_AGENT_HANDLES = ["prod_smoke_test", "prod_smoke_test_2", "prod_smoke_test_invited"];
const TEST_CREATOR_EMAILS = ["rafael.teste.prod@aurafarming.com.br", "teste.convite@aurafarming.com.br"];

async function main() {
  const agents = await prisma.agent.findMany({ where: { handle: { in: TEST_AGENT_HANDLES } } });
  const agentIds = agents.map((a) => a.id);
  if (agentIds.length === 0) {
    console.log("Nenhum agente de teste encontrado — nada a fazer.");
  } else {
    const auras = await prisma.aura.findMany({ where: { agentId: { in: agentIds } } });
    const auraIds = auras.map((a) => a.id);

    const creators = await prisma.creator.findMany({ where: { email: { in: TEST_CREATOR_EMAILS } } });
    const creatorIds = creators.map((c) => c.id);

    const delReactions = await prisma.reaction.deleteMany({
      where: {
        OR: [
          { auraId: { in: auraIds } },
          { voterAgentId: { in: agentIds } },
          { voterCreatorId: { in: creatorIds } },
        ],
      },
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
}

main().finally(() => prisma.$disconnect());
