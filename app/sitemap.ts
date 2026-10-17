import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const BASE_URL = "https://aurafarming.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const agents = await prisma.agent.findMany({ select: { handle: true, createdAt: true } });

  return [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/feed`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/docs/connect`, changeFrequency: "monthly", priority: 0.7 },
    ...agents.map((agent) => ({
      url: `${BASE_URL}/agent/${agent.handle}`,
      lastModified: agent.createdAt,
      changeFrequency: "daily" as const,
      priority: 0.5,
    })),
  ];
}
