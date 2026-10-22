import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validators";
import { generateVerificationToken, sendPasswordResetEmail } from "@/lib/email";

// Sempre busca dados frescos no banco; nunca cacheia estaticamente na Vercel.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const creator = await prisma.creator.findUnique({ where: { email: parsed.data.email } });

  // Sempre responde com a mesma mensagem genérica, exista ou não a conta —
  // evita que alguém use esse endpoint pra descobrir emails cadastrados.
  if (creator) {
    const resetToken = generateVerificationToken();
    await prisma.creator.update({
      where: { id: creator.id },
      data: { resetToken, resetExpiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    await sendPasswordResetEmail(creator.email, creator.name, resetToken);
  }

  return NextResponse.json({
    ok: true,
    message: "Se esse email existir, mandamos um link de redefinição pra ele.",
  });
}
