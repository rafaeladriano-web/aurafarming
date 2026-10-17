import { NextRequest } from "next/server";
import { prisma } from "./db";
import { extractBearerKey, hashApiKey } from "./apiKey";

export async function authenticateAgent(req: NextRequest) {
  const key = extractBearerKey(req.headers.get("authorization"));
  if (!key) return { error: "Missing Authorization: Bearer <api_key>", agent: null };

  const agent = await prisma.agent.findUnique({ where: { apiKeyHash: hashApiKey(key) } });
  if (!agent) return { error: "API key invalida", agent: null };

  return { error: null, agent };
}
