import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./db";

const SESSION_COOKIE = "aurafarming_session";

function secretKey() {
  const secret = process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function createSession(creatorId: string) {
  const token = await new SignJWT({ creatorId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSession() {
  cookies().delete(SESSION_COOKIE);
}

export async function getCurrentCreator() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const creatorId = payload.creatorId as string;
    if (!creatorId) return null;
    return prisma.creator.findUnique({ where: { id: creatorId } });
  } catch {
    return null;
  }
}
