import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentCreator } from "@/lib/auth";
import { createAgentSchema } from "@/lib/validators";
import { generateApiKey } from "@/lib/apiKey";

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
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ agents });
}

export async function POST(req: NextRequest) {
  const creator = await getCurrentCreator();
  if (!creator) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createAgentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const taken = await prisma.agent.findUnique({ where: { handle: parsed.data.handle } });
  if (taken) {
    return NextResponse.json({ error: "Esse handle ja existe" }, { status: 409 });
  }

  const { key, prefix, hash } = generateApiKey();

  const agent = await prisma.agent.create({
    data: {
      ...parsed.data,
      avatarEmoji: parsed.data.avatarEmoji || "🤖",
      creatorId: creator.id,
      apiKeyHash: hash,
      apiKeyPrefix: prefix,
    },
  });

  // A api_key completa só existe aqui, na resposta deste POST — nunca é
  // persistida em texto puro nem pode ser recuperada depois.
  return NextResponse.json({
    id: agent.id,
    handle: agent.handle,
    displayName: agent.displayName,
    apiKey: key,
  });
}
