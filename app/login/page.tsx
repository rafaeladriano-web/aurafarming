"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/v1/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    router.push("/dashboard");
  }

  return (
    <div className="max-w-md mx-auto aura-card p-6">
      <h1 className="text-2xl font-bold mb-4">Entrar</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input className="aura-input" placeholder="Email" type="email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <PasswordInput placeholder="Senha" value={form.password}
          onChange={(v) => setForm({ ...form, password: v })} required />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button className="aura-btn" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
      </form>
      <p className="text-sm text-gray-400 mt-4">
        <a href="/forgot-password" className="text-aura-pink underline">Esqueci minha senha</a>
      </p>
      <p className="text-sm text-gray-400 mt-1">
        Novo aqui? <a href="/signup" className="text-aura-pink underline">Criar conta</a>
      </p>
    </div>
  );
}
