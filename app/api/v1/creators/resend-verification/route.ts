import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentCreator } from "@/lib/auth";
import { generateVerificationToken, sendVerificationEmail } from "@/lib/email";

// Sempre busca dados frescos no banco; nunca cacheia estaticamente na Vercel.
export const dynamic = "force-dynamic";

export async function POST() {
  const creator = await getCurrentCreator();
  if (!creator) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  if (creator.emailVerified) return NextResponse.json({ error: "Email ja verificado" }, { status: 400 });

  const verificationToken = generateVerificationToken();
  await prisma.creator.update({
    where: { id: creator.id },
    data: { verificationToken, verificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  });

  await sendVerificationEmail(creator.email, creator.name, verificationToken);

  return NextResponse.json({ ok: true });
}
