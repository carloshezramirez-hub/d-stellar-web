import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY no está configurada.");
    _resend = new Resend(key);
  }
  return _resend;
}

export function isPaymentsEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_PAYMENTS_FROM_EMAIL);
}

type SendPaymentMailInput = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

/**
 * Confirmaciones de pago (boletos de evento, pedidos de pickup) — remitente
 * propio y aislado (RESEND_PAYMENTS_FROM_EMAIL) bajo el mismo dominio
 * mail.d-stellar.co pero distinto del usado para outreach en frío
 * (RESEND_FROM_EMAIL en lib/prospecting/resend-mailer.ts), para que una
 * queja de spam en outreach nunca manche la reputación de los correos
 * transaccionales de pago, y viceversa.
 *
 * Devuelve el id de Resend del mensaje — se guarda en web_orders para poder
 * cruzarlo luego con los eventos de bounce/complaint del webhook de Resend.
 */
export async function sendPaymentMail({ to, subject, html, replyTo }: SendPaymentMailInput) {
  const from = process.env.RESEND_PAYMENTS_FROM_EMAIL;
  if (!from) throw new Error("RESEND_PAYMENTS_FROM_EMAIL no está configurada.");

  const { data, error } = await getResend().emails.send({
    from,
    to,
    replyTo,
    subject,
    html,
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
  return { id: data?.id ?? null };
}
