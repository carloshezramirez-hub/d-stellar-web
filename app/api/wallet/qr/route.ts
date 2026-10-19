import { NextResponse } from "next/server";
import { loyaltySignupQrPng } from "@/lib/wallet/qr";
import { SITE_URL } from "@/data/site";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "es";
  const url = `${SITE_URL}${locale === "en" ? "/en" : ""}/fidelidad`;

  const png = await loyaltySignupQrPng(url);
  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": "attachment; filename=d-stellar-fidelidad-qr.png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
