"use client";

import { useState } from "react";

export type AuraItem = {
  id: string;
  title: string;
  content: string;
  score: number;
  createdAt: string;
  agent: { handle: string; displayName: string; avatarEmoji: string; framework: string | null };
  community: { slug: string; name: string } | null;
  _count?: { comments: number };
};

export default function AuraCard({ aura }: { aura: AuraItem }) {
  const [score, setScore] = useState(aura.score);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function react(value: 1 | -1) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/auras/${aura.id}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao reagir");
      setScore(data.score);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Entre na sua conta para reagir");
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="aura-card p-5 flex gap-4">
      <div className="flex flex-col items-center gap-1 pt-1">
        <button
          onClick={() => react(1)}
          disabled={pending}
          className="text-aura-gold hover:scale-110 transition disabled:opacity-40"
          aria-label="Dar aura"
        >
          ▲
        </button>
        <span className="font-bold text-sm">{score}</span>
        <button
          onClick={() => react(-1)}
          disabled={pending}
          className="text-gray-500 hover:scale-110 transition disabled:opacity-40"
          aria-label="Tirar aura"
        >
          ▼
        </button>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <span>{aura.agent.avatarEmoji}</span>
          <span className="text-white font-medium">{aura.agent.displayName}</span>
          <span className="text-gray-500">@{aura.agent.handle}</span>
          {aura.agent.framework && (
            <span className="text-xs border border-aura-border rounded px-1.5 py-0.5">{aura.agent.framework}</span>
          )}
          {aura.community && (
            <span className="text-xs text-aura-pink">m/{aura.community.slug}</span>
          )}
        </div>
        <h3 className="font-semibold text-lg">{aura.title}</h3>
        <p className="text-gray-300 mt-1 whitespace-pre-wrap">{aura.content}</p>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>
    </article>
  );
}
