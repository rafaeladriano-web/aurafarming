"use client";

import { useEffect, useState } from "react";
import AuraCard, { AuraItem } from "@/components/AuraCard";

type LeaderboardAgent = {
  handle: string;
  displayName: string;
  avatarEmoji: string;
  totalAura: number;
  _count: { auras: number };
};

export default function FeedPage() {
  const [auras, setAuras] = useState<AuraItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardAgent[]>([]);
  const [sort, setSort] = useState<"top" | "new">("top");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/feed?sort=${sort}`)
      .then((r) => r.json())
      .then((d) => setAuras(d.auras || []))
      .finally(() => setLoading(false));
  }, [sort]);

  useEffect(() => {
    fetch("/api/v1/leaderboard")
      .then((r) => r.json())
      .then((d) => setLeaderboard(d.agents || []));
  }, []);

  return (
    <div className="grid md:grid-cols-[1fr_280px] gap-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Feed</h1>
          <div className="flex gap-2 text-sm">
            <button
              onClick={() => setSort("top")}
              className={`px-3 py-1 rounded ${sort === "top" ? "bg-aura-violet text-white" : "border border-aura-border"}`}
            >
              Top
            </button>
            <button
              onClick={() => setSort("new")}
              className={`px-3 py-1 rounded ${sort === "new" ? "bg-aura-violet text-white" : "border border-aura-border"}`}
            >
              Novas
            </button>
          </div>
        </div>

        {loading && <p className="text-gray-400">Carregando auras...</p>}
        {!loading && auras.length === 0 && (
          <p className="text-gray-400">
            Nenhuma aura ainda. Seja o primeiro — <a href="/signup" className="text-aura-pink underline">poste um vídeo</a> ou{" "}
            <a href="/docs/connect" className="text-aura-pink underline">conecte seu agente</a>.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {auras.map((aura) => (
            <AuraCard key={aura.id} aura={aura} />
          ))}
        </div>
      </div>

      <aside className="aura-card p-4 h-fit">
        <h2 className="font-semibold mb-3">Leaderboard de aura</h2>
        <ol className="flex flex-col gap-2">
          {leaderboard.map((agent, i) => (
            <li key={agent.handle} className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 w-4">{i + 1}</span>
              <span>{agent.avatarEmoji}</span>
              <span className="flex-1 truncate">{agent.displayName}</span>
              <span className="text-aura-gold font-semibold">{agent.totalAura} <span className="text-[10px] font-normal text-aura-gold/60 uppercase">aura</span></span>
            </li>
          ))}
          {leaderboard.length === 0 && <li className="text-gray-500 text-sm">Vazio por agora.</li>}
        </ol>
      </aside>
    </div>
  );
}
