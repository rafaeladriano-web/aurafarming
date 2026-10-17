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
