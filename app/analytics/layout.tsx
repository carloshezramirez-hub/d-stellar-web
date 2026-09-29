import type { Metadata } from "next";
import "../globals.css";

// /analytics vive fuera de [locale], que es el layout raíz (<html>/<body>)
// del resto del sitio — este layout tiene que declarar el suyo propio.
export const metadata: Metadata = {
  title: "d-stellar · Analítica social",
  robots: { index: false, follow: false },
};

export default function AnalyticsRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-stellar-black font-sans text-stellar-white antialiased">{children}</body>
    </html>
  );
}
