export type CalendarCookie = {
  name: string;
  description: { es: string; en: string };
};

export type CalendarMonth = {
  monthKey: string; // "2026-08", sorts chronologically
  label: { es: string; en: string };
  cookies: CalendarCookie[];
};

// The monthly cookie archive. `data/menu.ts` → `gourmet-cookies` always
// holds only the *current* rotation (see PROJECT_NOTES.md → "Monthly cookie
// rotation"); this file keeps every month on the record so /calendar can
// show the collection month by month. When you update `menu.ts` for a new
// month, also push a new entry here with the outgoing month's lineup —
// don't overwrite, the whole point is the archive. Newest last.
export const cookieCalendar: CalendarMonth[] = [
  {
    monthKey: "2026-08",
    label: { es: "Agosto 2026", en: "August 2026" },
    cookies: [
      {
        name: "Nube Ámbar",
        description: {
          es: "Cookie de vainilla con corazón de pera rostizada, crema sedosa de mascarpone y tierra crujiente de cacao y café.",
          en: "Vanilla cookie with a roasted-pear center, silky mascarpone cream and a crunchy cacao-coffee crumble.",
        },
      },
      {
        name: "Bruma Zarza",
        description: {
          es: "Cookie vegana con confit de zarzamora y crema de frutos rojos.",
          en: "Vegan cookie with blackberry confit and red berry cream.",
        },
      },
      {
        name: "Aurora Rosada",
        description: {
          es: "Cookie de limón amarillo con crema ligera de vainilla y compota de tuna rosa.",
          en: "Yellow lemon cookie with light vanilla cream and pink prickly-pear compote.",
        },
      },
      {
        name: "Eclipse Rubí",
        description: {
          es: "Cookie de cacao intenso con crujiente oculto, ganache montada de chocolate y un centro ácido de granada.",
          en: "Intense cacao cookie with a hidden crunch, whipped chocolate ganache and a tart pomegranate center.",
        },
      },
      {
        name: "Última de Verano",
        description: {
          es: "Cookie de hojicha con crocante de arroz tostado, mango ácido y ganache aireada de chocolate blanco tostado.",
          en: "Hojicha cookie with toasted rice crunch, tart mango and airy toasted white chocolate ganache.",
        },
      },
    ],
  },
];

export function sortedCalendar() {
  return [...cookieCalendar].sort((a, b) => b.monthKey.localeCompare(a.monthKey));
}

export function currentCalendarMonth() {
  return sortedCalendar()[0];
}
