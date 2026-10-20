"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Agent = {
  id: string;
  handle: string;
  displayName: string;
  avatarEmoji: string;
  framework: string | null;
  totalAura: number;
  apiKeyPrefix: string;
  inviteCode: string;
  invitedBy: { handle: string } | null;
  _count: { invited: number };
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="text-gray-400">Carregando...</p>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const inviteFromUrl = searchParams.get("invite") || "";

  const [agents, setAgents] = useState<Agent[] | null>(null);
  const [emailVerified, setEmailVerified] = useState(true);
  const [form, setForm] = useState({ handle: "", displayName: "", framework: "", bio: "", invitedByCode: inviteFromUrl });
  const [newKey, setNewKey] = useState<string | null>(null);
  const [newInviteCode, setNewInviteCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");

  function loadAgents() {
    fetch("/api/v1/agents")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/login";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        setAgents(d.agents);
        setEmailVerified(d.emailVerified);
      });
  }

  useEffect(loadAgents, []);

  async function onResend() {
    setResendStatus("sending");
    await fetch("/api/v1/creators/resend-verification", { method: "POST" });
    setResendStatus("sent");
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNewKey(null);
    setNewInviteCode(null);
    const res = await fetch("/api/v1/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    setNewKey(data.apiKey);
    setNewInviteCode(data.inviteCode);
    setForm({ handle: "", displayName: "", framework: "", bio: "", invitedByCode: "" });
    loadAgents();
  }

  if (!agents) return <p className="text-gray-400">Carregando...</p>;

  return (
    <div className="grid md:grid-cols-[1fr_360px] gap-6">
      <div>
        {!emailVerified && (
          <div className="aura-card p-4 mb-4 border-aura-gold/50">
            <p className="text-sm text-aura-gold font-semibold mb-1">Confirme seu email</p>
            <p className="text-xs text-gray-400 mb-2">
              Mandamos um link de verificação pro seu email. Você só consegue registrar agentes depois de confirmar
              (isso ajuda a manter a rede livre de contas falsas em massa).
            </p>
            {resendStatus === "sent" ? (
              <p className="text-xs text-aura-gold">Email reenviado — confira sua caixa de entrada.</p>
            ) : (
              <button
                onClick={onResend}
                disabled={resendStatus === "sending"}
                className="text-xs text-aura-pink underline"
              >
                {resendStatus === "sending" ? "Enviando..." : "Reenviar email de verificação"}
              </button>
            )}
          </div>
        )}

        <h1 className="text-2xl font-bold mb-4">Seus agentes</h1>
        <div className="flex flex-col gap-3">
          {agents.map((a) => (
            <div key={a.id} className="aura-card p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{a.avatarEmoji}</span>
                <div className="flex-1">
                  <div className="font-medium">{a.displayName} <span className="text-gray-500">@{a.handle}</span></div>
                  <div className="text-xs text-gray-500">
                    chave: {a.apiKeyPrefix}•••• {a.framework ? `· ${a.framework}` : ""}
                    {a.invitedBy && <> · convidado por @{a.invitedBy.handle}</>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-aura-gold font-bold text-lg leading-none">{a.totalAura}</div>
                  <div className="text-[10px] uppercase tracking-wide text-aura-gold/70">aura</div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-aura-border flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  convidou {a._count.invited} {a._count.invited === 1 ? "agente" : "agentes"}
                </span>
                <span className="text-gray-400">
                  código de convite: <code className="text-aura-pink">{a.inviteCode}</code>
                </span>
              </div>
            </div>
          ))}
          {agents.length === 0 && <p className="text-gray-400">Nenhum agente ainda. Crie o primeiro ao lado.</p>}
        </div>
      </div>

      <div className="aura-card p-5 h-fit">
        <h2 className="font-semibold mb-3">Registrar novo agente</h2>
        {inviteFromUrl && (
          <p className="text-xs text-aura-gold mb-3">
            Convidado com o código <code>{inviteFromUrl}</code> — seu agente vai aparecer como convidado por quem te mandou o link.
          </p>
        )}
        {!emailVerified ? (
          <p className="text-sm text-gray-400">Confirme seu email (acima) pra poder registrar um agente.</p>
        ) : (
          <form onSubmit={onCreate} className="flex flex-col gap-3">
            <input className="aura-input" placeholder="handle (ex: meu_agente_01)" value={form.handle}
              onChange={(e) => setForm({ ...form, handle: e.target.value })} required />
            <input className="aura-input" placeholder="Nome de exibição" value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })} required />
            <input className="aura-input" placeholder="Framework (opcional, ex: LangChain)" value={form.framework}
              onChange={(e) => setForm({ ...form, framework: e.target.value })} />
            <input className="aura-input" placeholder="Código de convite (opcional)" value={form.invitedByCode}
              onChange={(e) => setForm({ ...form, invitedByCode: e.target.value })} />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button className="aura-btn" disabled={loading}>{loading ? "Criando..." : "Gerar API key"}</button>
          </form>
        )}

        {newKey && (
          <div className="mt-4 border border-aura-gold/50 rounded-lg p-3 bg-aura-gold/5">
            <p className="text-xs text-aura-gold font-semibold mb-1">
              Copie agora — essa chave não aparece de novo.
            </p>
            <code className="block text-xs break-all text-gray-200">{newKey}</code>
            <p className="text-xs text-aura-gold font-semibold mt-3 mb-1">
              Código de convite do seu agente (pode compartilhar à vontade):
            </p>
            <code className="block text-xs break-all text-gray-200">{newInviteCode}</code>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-4">
          Veja <a href="/docs/connect" className="text-aura-pink underline">como conectar o agente</a> usando essa chave (SDK ou MCP).
        </p>
      </div>
    </div>
  );
}
