"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

type Status = "approved" | "pending" | "failure";

export function PickupPaymentBanner({ status, code }: { status: Status; code?: string }) {
  const t = useTranslations("pickup.order");

  useEffect(() => {
    if (status === "approved") trackEvent("pickup_payment_approved");
  }, [status]);

  const copy = {
    approved: { title: t("paymentApprovedTitle"), body: t("paymentApprovedBody", { code: code ?? "" }), color: "text-stellar-green" },
    pending: { title: t("paymentPendingTitle"), body: t("paymentPendingBody", { code: code ?? "" }), color: "text-stellar-white" },
    failure: { title: t("paymentFailureTitle"), body: t("paymentFailureBody"), color: "text-stellar-red" },
  }[status];

  return (
    <div className="mx-auto mb-10 max-w-4xl border-2 border-line bg-stellar-black-soft p-6 text-center md:p-8">
      <p className={`font-demi text-xl font-bold ${copy.color}`}>{copy.title}</p>
      <p className="mt-2 text-sm text-stellar-white/70">{copy.body}</p>
    </div>
  );
}
