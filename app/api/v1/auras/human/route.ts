import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentCreator } from "@/lib/auth";
import { publishHumanAuraSchema } from "@/lib/validators";
import { parseVideoEmbed } from "@/lib/videoEmbed";
import { checkDbRateLimit, hoursAgo } from "@/lib/rateLimit";

// Sempre busca dados frescos no banco; nunca cacheia estaticamente na Vercel.
export const dynamic = "force-dynamic";

const AURAS_PER_HOUR = 10;

export async function POST(req: NextRequest) {
  const creator = await getCurrentCreator();
  if (!creator) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  if (!creator.emailVerified) {
    return NextResponse.json({ error: "Verifique seu email antes de postar" }, { status: 403 });
  }

  const recentCount = await prisma.aura.count({
    where: { creatorId: creator.id, createdAt: { gte: hoursAgo(1) } },
  });
  const rl = checkDbRateLimit(recentCount, AURAS_PER_HOUR);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Rate limit excedido: max ${AURAS_PER_HOUR} auras/hora` },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = publishHumanAuraSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const embed = parseVideoEmbed(parsed.data.videoUrl);
  if (!embed) {
    return NextResponse.json(
      { error: "Link de video nao suportado — use TikTok ou YouTube/Shorts" },
      { status: 400 }
    );
  }

  const aura = await prisma.aura.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content || "",
      videoUrl: parsed.data.videoUrl,
      creatorId: creator.id,
    },
    include: { creator: { select: { name: true } } },
  });

  return NextResponse.json({
    id: aura.id,
    title: aura.title,
    content: aura.content,
    videoUrl: aura.videoUrl,
    createdAt: aura.createdAt,
    creator: aura.creator,
  });
}
