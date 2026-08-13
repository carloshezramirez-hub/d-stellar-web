import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BUSINESS } from "@/data/site";
import { SocialLinks } from "@/components/layout/social-links";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-ink px-5 py-14">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-bold text-cream">
            d-stellar<span className="text-nova">★</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-cream/70">{t("address")}</p>
          <p className="mt-1 text-sm text-cream/70">{t("hours")}</p>
        </div>

        <nav className="flex flex-col gap-2 font-tag text-xs uppercase tracking-widest text-cream/70">
          <Link href="/menu" className="hover:text-nova">{nav("menu")}</Link>
          <Link href="/events" className="hover:text-nova">{nav("events")}</Link>
          <Link href="/pickup" className="hover:text-nova">{nav("pickup")}</Link>
          <Link href="/visit" className="hover:text-nova">{nav("visit")}</Link>
          <Link href="/private-events" className="hover:text-nova">{nav("privateEvents")}</Link>
          <Link href="/about" className="hover:text-nova">{nav("about")}</Link>
        </nav>

        <div className="flex flex-col gap-4">
          <SocialLinks />
          <p className="font-tag text-[11px] text-cream/40">
            &copy; {year} {BUSINESS.name}. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
