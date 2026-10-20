import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Sempre busca dados frescos no banco; nunca cacheia estaticamente na Vercel.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = body?.token;
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Token ausente" }, { status: 400 });
  }

  const creator = await prisma.creator.findUnique({ where: { verificationToken: token } });
  if (!creator) {
    return NextResponse.json({ error: "Token invalido" }, { status: 400 });
  }
  if (creator.verificationExpiresAt && creator.verificationExpiresAt < new Date()) {
    return NextResponse.json({ error: "Token expirado — peca um novo email de verificacao" }, { status: 400 });
  }

  await prisma.creator.update({
    where: { id: creator.id },
    data: { emailVerified: true, verificationToken: null, verificationExpiresAt: null },
  });

  return NextResponse.json({ ok: true });
}
