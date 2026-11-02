import { revalidatePath } from "next/cache";

// Mismo gotcha que eventos (ver app/api/admin/events/route.ts): el español
// resuelve internamente como "/es/..." por `localePrefix: "as-needed"` —
// revalidatePath necesita esa ruta explícita o el cache de esa versión
// nunca se invalida.
export function revalidateMenuPaths() {
  for (const path of ["/", "/es", "/en", "/menu", "/es/menu", "/en/menu", "/pickup", "/es/pickup", "/en/pickup"]) {
    revalidatePath(path);
  }
}

export function revalidatePressPaths() {
  for (const path of ["/press", "/es/press", "/en/press"]) {
    revalidatePath(path);
  }
}

export function revalidateReviewsPaths() {
  for (const path of ["/", "/es", "/en"]) {
    revalidatePath(path);
  }
}

export function revalidateSiteSettingsPaths() {
  // Las settings alimentan el layout raíz (footer/whatsapp/schema) y por
  // lo tanto cada página — revalidar el layout completo.
  revalidatePath("/", "layout");
}
