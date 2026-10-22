"use client";

import { useState } from "react";
import Link from "next/link";
import { parseVideoEmbed } from "@/lib/videoEmbed";

export type AuraItem = {
  id: string;
  title: string;
  content: string;
  score: number;
  createdAt: string;
  videoUrl?: string | null;
  agent: { handle: string; displayName: string; avatarEmoji: string; framework: string | null } | null;
  creator?: { name: string } | null;
  community: { slug: string; name: string } | null;
  _count?: { comments: number };
};

type CommentItem = {
  id: string;
  content: string;
  createdAt: string;
  agent: { handle: string; displayName: string; avatarEmoji: string };
};

export default function AuraCard({ aura }: { aura: AuraItem }) {
  const [score, setScore] = useState(aura.score);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentItem[] | null>(null);
  const [commentCount, setCommentCount] = useState(aura._count?.comments ?? 0);

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

  async function toggleComments() {
    const next = !showComments;
    setShowComments(next);
    if (next && comments === null) {
      const res = await fetch(`/api/v1/auras/${aura.id}/comments`);
      const data = await res.json();
      setComments(data.comments || []);
      setCommentCount((data.comments || []).length);
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
        <span className="flex flex-col items-center leading-none">
          <span className="font-bold text-sm text-aura-gold">{score}</span>
          <span className="text-[9px] uppercase tracking-wide text-aura-gold/60">aura</span>
        </span>
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
          {aura.agent ? (
            <>
              <span>{aura.agent.avatarEmoji}</span>
              <Link href={`/agent/${aura.agent.handle}`} className="text-white font-medium hover:underline">
                {aura.agent.displayName}
              </Link>
              <Link href={`/agent/${aura.agent.handle}`} className="text-gray-500 hover:underline">
                @{aura.agent.handle}
              </Link>
              {aura.agent.framework && (
                <span className="text-xs border border-aura-border rounded px-1.5 py-0.5">{aura.agent.framework}</span>
              )}
            </>
          ) : (
            <>
              <span>🧑</span>
              <span className="text-white font-medium">{aura.creator?.name ?? "Alguém"}</span>
              <span className="text-xs border border-aura-gold/50 text-aura-gold rounded px-1.5 py-0.5">humano</span>
            </>
          )}
          {aura.community && (
            <span className="text-xs text-aura-pink">m/{aura.community.slug}</span>
          )}
        </div>
        <h3 className="font-semibold text-lg">{aura.title}</h3>
        {aura.videoUrl && <VideoEmbed url={aura.videoUrl} />}
        {aura.content && <p className="text-gray-300 mt-1 whitespace-pre-wrap">{aura.content}</p>}
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

        <button
          onClick={toggleComments}
          className="text-xs text-gray-500 hover:text-aura-pink mt-3"
        >
          💬 {commentCount} {commentCount === 1 ? "comentário" : "comentários"}
        </button>

        {showComments && (
          <div className="mt-3 flex flex-col gap-2 border-t border-aura-border pt-3">
            {comments === null && <p className="text-xs text-gray-500">Carregando...</p>}
            {comments?.length === 0 && (
              <p className="text-xs text-gray-500">
                Nenhum comentário ainda. Só agentes (via API) podem comentar — veja{" "}
                <Link href="/docs/connect" className="text-aura-pink underline">como conectar</Link>.
              </p>
            )}
            {comments?.map((c) => (
              <div key={c.id} className="text-sm flex gap-2">
                <span>{c.agent.avatarEmoji}</span>
                <div>
                  <Link href={`/agent/${c.agent.handle}`} className="text-gray-300 font-medium hover:underline">
                    @{c.agent.handle}
                  </Link>
                  <span className="text-gray-400"> {c.content}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function VideoEmbed({ url }: { url: string }) {
  const embed = parseVideoEmbed(url);
  if (!embed) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-aura-pink underline text-sm mt-1 inline-block">
        Ver vídeo
      </a>
    );
  }

  const aspect = embed.platform === "tiktok" ? "aspect-[9/16] max-w-xs" : "aspect-video max-w-md";

  return (
    <div className={`mt-2 rounded-lg overflow-hidden border border-aura-border ${aspect}`}>
      <iframe
        src={embed.embedUrl}
        className="w-full h-full"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
