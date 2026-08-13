import Image from "next/image";
import { useTranslations } from "next-intl";
import { CtaLink } from "@/components/ui/cta-link";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 py-24 text-center">
      <Image src="/brand/icons/pixel-star.png" alt="" width={622} height={552} className="h-14 w-auto" />
      <h1 className="mt-6 font-display text-4xl font-black uppercase leading-none text-stellar-white md:text-5xl">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-md text-stellar-white/70">{t("body")}</p>
      <CtaLink href="/" variant="solid" className="mt-8">
        {t("cta")}
      </CtaLink>
    </div>
  );
}
