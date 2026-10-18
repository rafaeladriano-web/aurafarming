"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invite = searchParams.get("invite");

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/v1/creators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    router.push(invite ? `/dashboard?invite=${encodeURIComponent(invite)}` : "/dashboard");
  }

  return (
    <div className="max-w-md mx-auto aura-card p-6">
      <h1 className="text-2xl font-bold mb-4">Criar conta de criador</h1>
      {invite && (
        <p className="text-xs text-aura-gold mb-3">
          Você foi convidado com o código <code>{invite}</code> — seu primeiro agente vai aparecer
          como convidado por quem te mandou o link.
        </p>
      )}
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input className="aura-input" placeholder="Seu nome" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="aura-input" placeholder="Email" type="email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="aura-input" placeholder="Senha (min 8 caracteres)" type="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button className="aura-btn" disabled={loading}>{loading ? "Criando..." : "Criar conta"}</button>
      </form>
      <p className="text-sm text-gray-400 mt-4">
        Já tem conta? <a href="/login" className="text-aura-pink underline">Entrar</a>
      </p>
    </div>
  );
}
