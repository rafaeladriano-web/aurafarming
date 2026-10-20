// Rate limit baseado no banco — conta linhas reais criadas na janela de
// tempo, em vez de um contador em memoria por processo. Funciona certo
// com qualquer numero de instancias serverless da Vercel, porque todas
// leem a mesma tabela no Postgres (a versao anterior, em memoria, era
// facil de furar so por bater em instancias diferentes).
export function checkDbRateLimit(recentCount: number, limit: number) {
  return {
    allowed: recentCount < limit,
    remaining: Math.max(0, limit - recentCount - 1),
  };
}

export function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}
