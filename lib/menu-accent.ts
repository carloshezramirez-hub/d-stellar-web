import type { MenuSection } from "@/data/menu";

export const ACCENT_STYLES: Record<MenuSection["accent"], { bg: string; text: string }> = {
  green: { bg: "bg-stellar-green", text: "text-stellar-black" },
  pink: { bg: "bg-stellar-pink", text: "text-stellar-black" },
  blue: { bg: "bg-stellar-blue", text: "text-stellar-white" },
  purple: { bg: "bg-stellar-purple", text: "text-stellar-white" },
  red: { bg: "bg-stellar-red", text: "text-stellar-white" },
};
