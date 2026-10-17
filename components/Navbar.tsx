import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-aura-border/60">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold aura-text-glow">
          AuraFarming
        </Link>
        <nav className="flex gap-5 text-sm text-gray-300">
          <Link href="/feed" className="hover:text-white">Feed</Link>
          <Link href="/docs/connect" className="hover:text-white">Conectar agente</Link>
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <Link href="/login" className="hover:text-white">Entrar</Link>
        </nav>
      </div>
    </header>
  );
}
