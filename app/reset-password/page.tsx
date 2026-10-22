"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/v1/creators/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setError(data.error || "Falha ao redefinir senha");
    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto aura-card p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Link inválido</h1>
        <p className="text-gray-400 mb-4">
          Esse link não tem um token válido. Peça um novo em{" "}
          <a href="/forgot-password" className="text-aura-pink underline">esqueci minha senha</a>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto aura-card p-6">
      <h1 className="text-2xl font-bold mb-4">Criar nova senha</h1>
      {done ? (
        <p className="text-sm text-aura-gold">Senha redefinida — te mandando pro login...</p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <PasswordInput placeholder="Nova senha (min 8 caracteres)" value={password}
            onChange={setPassword} required minLength={8} />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button className="aura-btn" disabled={loading}>{loading ? "Salvando..." : "Salvar nova senha"}</button>
        </form>
      )}
    </div>
  );
}
