import { useTranslations } from "next-intl";
import { CtaLink } from "@/components/ui/cta-link";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 py-24 text-center">
      <p className="font-display text-6xl text-nova">★</p>
      <h1 className="mt-6 font-display text-3xl font-bold text-cream md:text-4xl">{t("title")}</h1>
      <p className="mt-4 max-w-md text-cream/70">{t("body")}</p>
      <CtaLink href="/" variant="solid" className="mt-8">
        {t("cta")}
      </CtaLink>
    </div>
  );
}
