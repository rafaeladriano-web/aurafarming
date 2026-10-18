import { nanoid } from "nanoid";
import crypto from "crypto";

const PREFIX = "afk_";

export function generateApiKey() {
  const secret = nanoid(40);
  const key = `${PREFIX}${secret}`;
  const prefix = key.slice(0, 10);
  const hash = hashApiKey(key);
  return { key, prefix, hash };
}

export function hashApiKey(key: string) {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export function extractBearerKey(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

const INVITE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem I/O/0/1, menos ambiguo pra copiar
export function generateInviteCode() {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += INVITE_ALPHABET[Math.floor(Math.random() * INVITE_ALPHABET.length)];
  }
  return code;
}
