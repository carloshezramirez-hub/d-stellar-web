export type HoursException = { dayOfWeek: string; opens: string; closes: string };

export type SiteSettings = {
  hours: { opens: string; closes: string };
  hoursExceptions: HoursException[];
  phone: string;
  phoneHref: string;
  whatsappUrl: string;
  email: string;
  social: { instagram: string; tiktok: string; facebook: string; linkedin: string };
  menuMonthLabel: { es: string; en: string };
  seasonalDecorEnabled: boolean;
  seasonalDecorVariant: string | null;
};

// Valores en código al momento de migrar esto a Supabase (2026-11-02) — solo
// se usan como red de seguridad si la tabla site_settings está vacía o
// Supabase no está configurado (build/preview sin credenciales), para que
// el sitio nunca se quede sin estos datos. La fuente real una vez migrado
// es la tabla, editable desde /admin/contenido/negocio.
export const SITE_SETTINGS_FALLBACK: SiteSettings = {
  hours: { opens: "11:00", closes: "19:00" },
  hoursExceptions: [
    { dayOfWeek: "Tuesday", opens: "14:00", closes: "19:00" },
    { dayOfWeek: "Wednesday", opens: "12:00", closes: "19:00" },
    { dayOfWeek: "Friday", opens: "12:00", closes: "19:00" },
  ],
  phone: "+52 55 6502 4440",
  phoneHref: "+525565024440",
  whatsappUrl: "https://wa.me/525565024440",
  email: "hernan@dstellar.com",
  social: {
    instagram: "https://www.instagram.com/dstellarmx",
    tiktok: "https://www.tiktok.com/@dstellarmx",
    facebook: "https://www.facebook.com/profile.php?id=61570406427384",
    linkedin: "https://www.linkedin.com/company/d-stellar/",
  },
  menuMonthLabel: { es: "Menú de octubre y noviembre", en: "October & November menu" },
  seasonalDecorEnabled: true,
  seasonalDecorVariant: "dia-de-muertos",
};
