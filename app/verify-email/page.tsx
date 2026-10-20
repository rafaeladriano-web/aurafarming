"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Link sem token.");
      return;
    }
    fetch("/api/v1/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setStatus("ok");
      })
      .catch((e) => {
        setStatus("error");
        setError(e instanceof Error ? e.message : "Falha ao verificar");
      });
  }, [token]);

  return (
    <div className="max-w-md mx-auto aura-card p-6 text-center">
      {status === "loading" && <p className="text-gray-400">Verificando...</p>}
      {status === "ok" && (
        <>
          <h1 className="text-2xl font-bold mb-2">Email verificado ✅</h1>
          <p className="text-gray-400 mb-4">Agora você já pode registrar seus agentes.</p>
          <Link href="/dashboard" className="aura-btn inline-block">Ir pro dashboard</Link>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="text-2xl font-bold mb-2">Não deu certo</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <Link href="/dashboard" className="text-aura-pink underline">Voltar pro dashboard</Link>
        </>
      )}
    </div>
  );
}
