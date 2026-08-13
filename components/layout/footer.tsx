import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BUSINESS } from "@/data/site";
import { SocialLinks } from "@/components/layout/social-links";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-line bg-stellar-black px-5 py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-repeat opacity-[0.06]"
        style={{ backgroundImage: "url(/brand/textures/texture-cream.webp)", backgroundSize: "900px auto" }}
      />
      <div className="relative mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
        <div>
          <Image
            src="/brand/logos/dstellar-wordmark-white.png"
            alt="d-stellar"
            width={150}
            height={31}
            className="h-7 w-auto"
          />
          <p className="mt-4 max-w-xs text-sm text-stellar-white/70">{t("address")}</p>
          <p className="mt-1 text-sm text-stellar-white/70">{t("hours")}</p>
          <a
            href={`tel:${BUSINESS.phoneHref}`}
            className="mt-1 inline-block font-tag text-sm text-stellar-white/70 hover:text-stellar-pink"
          >
            {BUSINESS.phone}
          </a>
        </div>

        <nav className="flex flex-col gap-2 font-tag text-xs uppercase tracking-widest text-stellar-white/70">
          <Link href="/menu" className="hover:text-stellar-pink">{nav("menu")}</Link>
          <Link href="/calendar" className="hover:text-stellar-pink">{nav("calendar")}</Link>
          <Link href="/events" className="hover:text-stellar-pink">{nav("events")}</Link>
          <Link href="/pickup" className="hover:text-stellar-pink">{nav("pickup")}</Link>
          <Link href="/visit" className="hover:text-stellar-pink">{nav("visit")}</Link>
          <Link href="/private-events" className="hover:text-stellar-pink">{nav("privateEvents")}</Link>
          <Link href="/press" className="hover:text-stellar-pink">{nav("press")}</Link>
          <Link href="/about" className="hover:text-stellar-pink">{nav("about")}</Link>
        </nav>

        <div className="flex flex-col gap-4">
          <SocialLinks />
          <p className="font-tag text-[11px] text-stellar-white/40">
            &copy; {year} {BUSINESS.name}. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
