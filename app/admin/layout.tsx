import type { Metadata } from "next";
import "../globals.css";

// /admin vive fuera de [locale], que es el layout raíz (<html>/<body>) del
// resto del sitio — este layout tiene que declarar el suyo propio. Mismo
// patrón que /analytics, /pedidos y /wallet-staff (que ahora cuelgan de
// este panel único).
export const metadata: Metadata = {
  title: "d-stellar · Panel",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-stellar-black font-sans text-stellar-white antialiased">{children}</body>
    </html>
  );
}
