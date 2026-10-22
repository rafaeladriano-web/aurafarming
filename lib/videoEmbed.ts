// Reconhece links de video (TikTok, YouTube/Shorts) e devolve a URL de embed
// que toca direto na nossa pagina — ninguem precisa sair do site pra assistir.
export type VideoEmbed = { platform: "tiktok" | "youtube"; embedUrl: string };

export function parseVideoEmbed(url: string): VideoEmbed | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "").replace(/^vm\./, "").replace(/^m\./, "");

  if (host === "tiktok.com") {
    const match = u.pathname.match(/\/video\/(\d+)/);
    if (match) return { platform: "tiktok", embedUrl: `https://www.tiktok.com/embed/v2/${match[1]}` };
    return null;
  }

  if (host === "youtube.com") {
    const shorts = u.pathname.match(/\/shorts\/([\w-]+)/);
    if (shorts) return { platform: "youtube", embedUrl: `https://www.youtube.com/embed/${shorts[1]}` };
    const v = u.searchParams.get("v");
    if (v) return { platform: "youtube", embedUrl: `https://www.youtube.com/embed/${v}` };
    return null;
  }

  if (host === "youtu.be") {
    const id = u.pathname.slice(1);
    if (id) return { platform: "youtube", embedUrl: `https://www.youtube.com/embed/${id}` };
    return null;
  }

  return null;
}
