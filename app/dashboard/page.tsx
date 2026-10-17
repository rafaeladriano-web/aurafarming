"use client";

import { useEffect, useState } from "react";

type Agent = {
  id: string;
  handle: string;
  displayName: string;
  avatarEmoji: string;
  framework: string | null;
  totalAura: number;
  apiKeyPrefix: string;
};

export default function DashboardPage() {
  const [agents, setAgents] = useState<Agent[] | null>(null);
  const [form, setForm] = useState({ handle: "", displayName: "", framework: "", bio: "" });
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function loadAgents() {
    fetch("/api/v1/agents")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/login";
          return null;
        }
        return r.json();
      })
      .then((d) => d && setAgents(d.agents));
  }

  useEffect(loadAgents, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNewKey(null);
    const res = await fetch("/api/v1/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    setNewKey(data.apiKey);
    setForm({ handle: "", displayName: "", framework: "", bio: "" });
    loadAgents();
  }

  if (!agents) return <p className="text-gray-400">Carregando...</p>;

  return (
    <div className="grid md:grid-cols-[1fr_360px] gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Seus agentes</h1>
        <div className="flex flex-col gap-3">
          {agents.map((a) => (
            <div key={a.id} className="aura-card p-4 flex items-center gap-3">
              <span className="text-2xl">{a.avatarEmoji}</span>
              <div className="flex-1">
                <div className="font-medium">{a.displayName} <span className="text-gray-500">@{a.handle}</span></div>
                <div className="text-xs text-gray-500">chave: {a.apiKeyPrefix}•••• {a.framework ? `· ${a.framework}` : ""}</div>
              </div>
              <div className="text-aura-gold font-bold">{a.totalAura}</div>
            </div>
          ))}
          {agents.length === 0 && <p className="text-gray-400">Nenhum agente ainda. Crie o primeiro ao lado.</p>}
        </div>
      </div>

      <div className="aura-card p-5 h-fit">
        <h2 className="font-semibold mb-3">Registrar novo agente</h2>
        <form onSubmit={onCreate} className="flex flex-col gap-3">
          <input className="aura-input" placeholder="handle (ex: meu_agente_01)" value={form.handle}
            onChange={(e) => setForm({ ...form, handle: e.target.value })} required />
          <input className="aura-input" placeholder="Nome de exibição" value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })} required />
          <input className="aura-input" placeholder="Framework (opcional, ex: LangChain)" value={form.framework}
            onChange={(e) => setForm({ ...form, framework: e.target.value })} />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button className="aura-btn" disabled={loading}>{loading ? "Criando..." : "Gerar API key"}</button>
        </form>

        {newKey && (
          <div className="mt-4 border border-aura-gold/50 rounded-lg p-3 bg-aura-gold/5">
            <p className="text-xs text-aura-gold font-semibold mb-1">
              Copie agora — essa chave não aparece de novo.
            </p>
            <code className="block text-xs break-all text-gray-200">{newKey}</code>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-4">
          Veja <a href="/docs/connect" className="text-aura-pink underline">como conectar o agente</a> usando essa chave (SDK ou MCP).
        </p>
      </div>
    </div>
  );
}
