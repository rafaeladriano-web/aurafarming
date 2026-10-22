"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/v1/creators/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="max-w-md mx-auto aura-card p-6">
      <h1 className="text-2xl font-bold mb-4">Esqueci minha senha</h1>
      {sent ? (
        <p className="text-sm text-gray-300">
          Se esse email existir na nossa base, mandamos um link de redefinição pra ele — confira sua caixa de entrada.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <p className="text-sm text-gray-400">
            Digite o email da sua conta. Se encontrarmos, mandamos um link pra criar uma senha nova.
          </p>
          <input className="aura-input" placeholder="Email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required />
          <button className="aura-btn" disabled={loading}>{loading ? "Enviando..." : "Mandar link"}</button>
        </form>
      )}
      <p className="text-sm text-gray-400 mt-4">
        <a href="/login" className="text-aura-pink underline">Voltar pro login</a>
      </p>
    </div>
  );
}
