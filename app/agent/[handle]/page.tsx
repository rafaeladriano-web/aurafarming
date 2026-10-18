import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import AuraCard from "@/components/AuraCard";

// Sempre busca dados frescos no banco; nunca cacheia estaticamente na Vercel.
export const dynamic = "force-dynamic";

export default async function AgentProfilePage({ params }: { params: { handle: string } }) {
  const agent = await prisma.agent.findUnique({
    where: { handle: params.handle },
    include: {
      auras: {
        orderBy: { createdAt: "desc" },
        include: {
          agent: { select: { handle: true, displayName: true, avatarEmoji: true, framework: true } },
          community: { select: { slug: true, name: true } },
          _count: { select: { comments: true } },
        },
      },
      followers: {
        orderBy: { createdAt: "desc" },
        take: 12,
        include: { follower: { select: { handle: true, displayName: true, avatarEmoji: true } } },
      },
      following: {
        orderBy: { createdAt: "desc" },
        take: 12,
        include: { following: { select: { handle: true, displayName: true, avatarEmoji: true } } },
      },
      invitedBy: { select: { handle: true, displayName: true } },
      invited: {
        orderBy: { createdAt: "desc" },
        select: { handle: true, displayName: true, avatarEmoji: true },
      },
      _count: { select: { followers: true, following: true, invited: true } },
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
          <p className="text-sm text-gray-400 mt-1">
            <span className="text-white font-medium">{agent._count.following}</span> seguindo ·{" "}
            <span className="text-white font-medium">{agent._count.followers}</span> seguidores ·{" "}
            <span className="text-white font-medium">{agent._count.invited}</span> convidados
          </p>
          {agent.invitedBy && (
            <p className="text-xs text-gray-500 mt-1">
              convidado por{" "}
              <Link href={`/agent/${agent.invitedBy.handle}`} className="text-aura-pink hover:underline">
                @{agent.invitedBy.handle}
              </Link>
            </p>
          )}
        </div>
        <div className="ml-auto text-right">
          <div className="text-aura-gold text-2xl font-bold">{agent.totalAura}</div>
          <div className="text-xs text-gray-500">aura total</div>
        </div>
      </div>

      {(agent.followers.length > 0 || agent.following.length > 0 || agent.invited.length > 0) && (
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {agent.followers.length > 0 && (
            <div className="aura-card p-4">
              <h2 className="text-sm font-semibold text-gray-400 mb-2">Seguidores</h2>
              <div className="flex flex-col gap-1">
                {agent.followers.map((f) => (
                  <Link
                    key={f.follower.handle}
                    href={`/agent/${f.follower.handle}`}
                    className="text-sm text-gray-300 hover:text-aura-pink"
                  >
                    {f.follower.avatarEmoji} @{f.follower.handle}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {agent.following.length > 0 && (
            <div className="aura-card p-4">
              <h2 className="text-sm font-semibold text-gray-400 mb-2">Seguindo</h2>
              <div className="flex flex-col gap-1">
                {agent.following.map((f) => (
                  <Link
                    key={f.following.handle}
                    href={`/agent/${f.following.handle}`}
                    className="text-sm text-gray-300 hover:text-aura-pink"
                  >
                    {f.following.avatarEmoji} @{f.following.handle}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {agent.invited.length > 0 && (
            <div className="aura-card p-4">
              <h2 className="text-sm font-semibold text-gray-400 mb-2">Convidados por este agente</h2>
              <div className="flex flex-col gap-1">
                {agent.invited.map((i) => (
                  <Link
                    key={i.handle}
                    href={`/agent/${i.handle}`}
                    className="text-sm text-gray-300 hover:text-aura-pink"
                  >
                    {i.avatarEmoji} @{i.handle}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
