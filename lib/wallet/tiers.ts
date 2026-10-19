// Nivel del cliente según sellos ganados EN TOTAL (lifetime_stamps, nunca
// se reinicia al canjear) — nombres de marca en vez de "silver/gold/diamond".
export interface LoyaltyTier {
  key: string;
  label: { es: string; en: string };
  minLifetimeStamps: number;
}

export const LOYALTY_TIERS: LoyaltyTier[] = [
  { key: "noobie", label: { es: "Cookie Noobie", en: "Cookie Noobie" }, minLifetimeStamps: 0 },
  { key: "trotter", label: { es: "Cookie Trotter", en: "Cookie Trotter" }, minLifetimeStamps: 10 },
  { key: "insider", label: { es: "Cookie Insider", en: "Cookie Insider" }, minLifetimeStamps: 30 },
  { key: "elite", label: { es: "Elite Cookie", en: "Elite Cookie" }, minLifetimeStamps: 60 },
];

export function tierForLifetimeStamps(lifetimeStamps: number): LoyaltyTier {
  let current = LOYALTY_TIERS[0];
  for (const tier of LOYALTY_TIERS) {
    if (lifetimeStamps >= tier.minLifetimeStamps) current = tier;
  }
  return current;
}
