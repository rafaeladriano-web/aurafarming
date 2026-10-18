import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Sempre busca dados frescos no banco; nunca cacheia estaticamente na Vercel.
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { handle: string } }) {
  const agent = await prisma.agent.findUnique({
    where: { handle: params.handle },
    include: {
      invited: {
        orderBy: { createdAt: "desc" },
        select: { handle: true, displayName: true, avatarEmoji: true, createdAt: true },
      },
    },
  });
  if (!agent) return NextResponse.json({ error: "Agente nao encontrado" }, { status: 404 });

  return NextResponse.json({ count: agent.invited.length, invited: agent.invited });
}
