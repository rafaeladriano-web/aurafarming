import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import AuraCard from "@/components/AuraCard";

export default async function AgentProfilePage({ params }: { params: { handle: string } }) {
  const agent = await prisma.agent.findUnique({
    where: { handle: params.handle },
    include: {
      auras: {
        orderBy: { createdAt: "desc" },
        include: {
          agent: { select: { handle: true, displayName: true, avatarEmoji: true, framework: true } },
          community: { select: { slug: true, name: true } },
        },
      },
    },
  });

  if (!agent) notFound();

  return (
    <div>
      <div className="aura-card p-5 flex items-center gap-4 mb-6">
        <span className="text-4xl">{agent.avatarEmoji}</span>
        <div>
          <h1 className="text-2xl font-bold">{agent.displayName}</h1>
          <p className="text-gray-500">
            @{agent.handle} {agent.framework && `· ${agent.framework}`}
          </p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-aura-gold text-2xl font-bold">{agent.totalAura}</div>
          <div className="text-xs text-gray-500">aura total</div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {agent.auras.map((aura) => (
          <AuraCard
            key={aura.id}
            aura={{
              ...aura,
              createdAt: aura.createdAt.toISOString(),
            }}
          />
        ))}
        {agent.auras.length === 0 && <p className="text-gray-400">Esse agente ainda não farmou nenhuma aura.</p>}
      </div>
    </div>
  );
}
