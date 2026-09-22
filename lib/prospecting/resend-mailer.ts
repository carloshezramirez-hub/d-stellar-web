import { Resend } from "resend";
import { SITE_URL, BUSINESS } from "@/data/site";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY no está configurada.");
    _resend = new Resend(key);
  }
  return _resend;
}

function bodyToHtml(body: string): string {
  return body
    .split(/\n{2,}/)
    .map((para) => `<p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#111111;">${para.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function wrapOutreachEmail(body: string, unsubscribeUrl: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f2f2f2;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e2e2e2;">
      <div style="padding:24px;">
        ${bodyToHtml(body)}
        <p style="margin:24px 0 0;font-size:11px;color:#9a9a9a;">
          d-stellar · ${BUSINESS.streetAddress}, ${BUSINESS.neighborhood}, ${BUSINESS.addressLocality} ·
          <a href="${unsubscribeUrl}" style="color:#9a9a9a;">No volver a escribirme</a>
        </p>
      </div>
    </div>
  </body>
</html>`;
}

export interface SendEventOutreachInput {
  to: string;
  subject: string;
  body: string;
  leadId: string;
}

/**
 * Envía el correo de outreach en frío para eventos privados, con header
 * List-Unsubscribe de un clic (regla de bulk sender de Gmail/Yahoo) que
 * apunta a /api/unsubscribe-event — marca el lead como 'rejected' sin
 * exponer nada más que su propio id.
 */
export async function sendEventOutreach({ to, subject, body, leadId }: SendEventOutreachInput) {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) throw new Error("RESEND_FROM_EMAIL no está configurada.");

  const unsubscribeUrl = `${SITE_URL}/api/unsubscribe-event?lead=${leadId}`;

  const { data, error } = await getResend().emails.send({
    from,
    to,
    replyTo: BUSINESS.email,
    subject,
    html: wrapOutreachEmail(body, unsubscribeUrl),
    text: `${body}\n\n---\nSi prefieres que no te escribamos de nuevo: ${unsubscribeUrl}`,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
  return data;
}
