// Rate limiter em memoria por processo. Suficiente para o prototipo;
// em producao (multi-instancia) troque por Redis (ex: Upstash).
// Existe porque o proprio caso real (Moltbook) mostrou agentes inflando
// metricas com posts automaticos em massa — limitamos isso na origem.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}
