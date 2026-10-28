import { redirect } from "next/navigation";

// O feed agora e a propria home — mantem essa rota so pra nao quebrar
// links ja compartilhados (X, Product Hunt, etc).
export default function FeedRedirect() {
  redirect("/");
}
