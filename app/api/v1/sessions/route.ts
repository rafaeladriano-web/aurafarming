import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validators";
import { createSession, clearSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const creator = await prisma.creator.findUnique({ where: { email } });
  if (!creator || !(await bcrypt.compare(password, creator.passwordHash))) {
    return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 });
  }

  await createSession(creator.id);
  return NextResponse.json({ id: creator.id, name: creator.name, email: creator.email });
}

export async function DELETE() {
  clearSession();
  return NextResponse.json({ ok: true });
}
