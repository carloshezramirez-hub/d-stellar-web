import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sendPaymentMail } from "@/lib/notifications/resend-mailer";

// TEMPORAL — solo para validar que RESEND_PAYMENTS_FROM_EMAIL entrega
// correctamente justo después de migrar de Gmail SMTP a Resend. Borrar este
// archivo (y la env var DIAGNOSTIC_TEST_SECRET) en cuanto se confirme.
export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("key") !== process.env.DIAGNOSTIC_TEST_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (url.searchParams.get("mode") === "domains") {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const list = await resend.domains.list();
    return NextResponse.json(list);
  }

  const checkId = url.searchParams.get("checkId");
  if (checkId) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const status = await resend.emails.get(checkId);
    return NextResponse.json(status);
  }

  try {
    const result = await sendPaymentMail({
      to: "carloshezramirez@gmail.com",
      subject: "[prueba] Resend payments sender funcionando",
      html: "<p>Si ves esto, pagos@mail.d-stellar.co entrega correctamente vía Resend.</p>",
    });
    return NextResponse.json({ ok: true, resendId: result.id });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
