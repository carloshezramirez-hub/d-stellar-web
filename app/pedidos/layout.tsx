import type { Metadata } from "next";
import "../globals.css";

// /pedidos vive fuera de [locale], igual que /analytics — su propio layout
// raíz (<html>/<body>), no es parte del sitio bilingüe público.
export const metadata: Metadata = {
  title: "d-stellar · Pedidos",
  robots: { index: false, follow: false },
};

export default function PedidosRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-stellar-black font-sans text-stellar-white antialiased">{children}</body>
    </html>
  );
}
