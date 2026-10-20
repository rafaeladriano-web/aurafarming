import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentCreator } from "@/lib/auth";
import { createAgentSchema } from "@/lib/validators";
import { generateApiKey, generateInviteCode } from "@/lib/apiKey";

// Sempre busca dados frescos no banco; nunca cacheia estaticamente na Vercel.
export const dynamic = "force-dynamic";

export async function GET() {
  const creator = await getCurrentCreator();
  if (!creator) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const agents = await prisma.agent.findMany({
    where: { creatorId: creator.id },
    select: {
      id: true,
      handle: true,
      displayName: true,
      avatarEmoji: true,
      framework: true,
      totalAura: true,
      apiKeyPrefix: true,
      createdAt: true,
      inviteCode: true,
      invitedBy: { select: { handle: true } },
      _count: { select: { invited: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ agents, emailVerified: creator.emailVerified });
}

async function uniqueInviteCode() {
  for (let i = 0; i < 5; i++) {
    const code = generateInviteCode();
    const taken = await prisma.agent.findUnique({ where: { inviteCode: code } });
    if (!taken) return code;
  }
  throw new Error("Nao foi possivel gerar um codigo de convite unico");
}

export async function POST(req: NextRequest) {
  const creator = await getCurrentCreator();
  if (!creator) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  if (!creator.emailVerified) {
    return NextResponse.json(
      { error: "Verifique seu email antes de registrar um agente" },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = createAgentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { invitedByCode, ...agentInput } = parsed.data;

  const taken = await prisma.agent.findUnique({ where: { handle: agentInput.handle } });
  if (taken) {
    return NextResponse.json({ error: "Esse handle ja existe" }, { status: 409 });
  }

  let invitedById: string | undefined;
  if (invitedByCode) {
    const inviter = await prisma.agent.findUnique({ where: { inviteCode: invitedByCode.toUpperCase() } });
    if (!inviter) {
      return NextResponse.json({ error: "Codigo de convite invalido" }, { status: 400 });
    }
    invitedById = inviter.id;
  }

  const { key, prefix, hash } = generateApiKey();
  const inviteCode = await uniqueInviteCode();

  const agent = await prisma.agent.create({
    data: {
      ...agentInput,
      avatarEmoji: agentInput.avatarEmoji || "🤖",
      creatorId: creator.id,
      apiKeyHash: hash,
      apiKeyPrefix: prefix,
      inviteCode,
      invitedById,
    },
  });

  // A api_key completa só existe aqui, na resposta deste POST — nunca é
  // persistida em texto puro nem pode ser recuperada depois.
  return NextResponse.json({
    id: agent.id,
    handle: agent.handle,
    displayName: agent.displayName,
    apiKey: key,
    inviteCode: agent.inviteCode,
  });
}
