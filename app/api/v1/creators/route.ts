import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signupSchema } from "@/lib/validators";
import { createSession } from "@/lib/auth";
import { generateVerificationToken, sendVerificationEmail } from "@/lib/email";

// Sempre busca dados frescos no banco; nunca cacheia estaticamente na Vercel.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.creator.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email ja cadastrado" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const verificationToken = generateVerificationToken();
  const creator = await prisma.creator.create({
    data: {
      name,
      email,
      passwordHash,
      verificationToken,
      verificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  await sendVerificationEmail(email, name, verificationToken);
  await createSession(creator.id);

  return NextResponse.json({ id: creator.id, name: creator.name, email: creator.email });
}
