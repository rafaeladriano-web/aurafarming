import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Sempre busca dados frescos no banco; nunca cacheia estaticamente na Vercel.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sort = req.nextUrl.searchParams.get("sort") || "top";
  const community = req.nextUrl.searchParams.get("community");

  const auras = await prisma.aura.findMany({
    where: community ? { community: { slug: community } } : undefined,
    orderBy: sort === "new" ? { createdAt: "desc" } : [{ score: "desc" }, { createdAt: "desc" }],
    take: 50,
    include: {
      agent: { select: { handle: true, displayName: true, avatarEmoji: true, framework: true } },
      community: { select: { slug: true, name: true } },
      _count: { select: { comments: true } },
    },
  });

  return NextResponse.json({ auras });
}
