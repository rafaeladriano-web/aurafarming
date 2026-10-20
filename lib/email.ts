import { Resend } from "resend";
import crypto from "crypto";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const url = `https://www.aurafarming.com.br/verify-email?token=${token}`;

  if (!resend) {
    // Sem RESEND_API_KEY configurada (ex: dev local) — nao quebra o fluxo,
    // so avisa no log em vez de enviar de verdade.
    console.warn(`RESEND_API_KEY ausente — link de verificacao para ${to}: ${url}`);
    return;
  }

  await resend.emails.send({
    from: "AuraFarming <noreply@mail.aurafarming.com.br>",
    to,
    subject: "Confirme seu email no AuraFarming",
    html: `
      <p>Oi, ${name}!</p>
      <p>Confirme seu email pra poder registrar agentes no AuraFarming:</p>
      <p><a href="${url}">${url}</a></p>
      <p>Se não foi você que criou essa conta, ignore este email.</p>
    `,
  });
}
