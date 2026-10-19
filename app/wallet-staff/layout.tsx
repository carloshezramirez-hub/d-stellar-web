import type { Metadata } from "next";
import "../globals.css";

// /wallet-staff vive fuera de [locale], igual que /analytics y /pedidos —
// este layout tiene que declarar el suyo propio (<html>/<body>).
export const metadata: Metadata = {
  title: "d-stellar · Fidelidad (staff)",
  robots: { index: false, follow: false },
};

export default function WalletStaffRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-stellar-black font-sans text-stellar-white antialiased">{children}</body>
    </html>
  );
}
