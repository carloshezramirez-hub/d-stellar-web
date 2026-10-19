"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { WalletStaffScanner } from "@/components/wallet-staff/scanner";

export default function WalletStaffPage() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/wallet-staff/logout", { method: "POST" });
    router.push("/wallet-staff/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen">
      <header className="flex items-center justify-between border-b border-line px-6 py-4">
        <h1 className="font-demi text-sm font-bold uppercase tracking-widest text-stellar-white">
          d-stellar · Fidelidad
        </h1>
        <div className="flex items-center gap-4">
          <Link href="/wallet-staff/clientes" className="text-xs text-stellar-white/60 underline underline-offset-4">
            Ver clientes
          </Link>
          <button type="button" onClick={logout} className="text-xs text-stellar-white/60 underline underline-offset-4">
            Salir
          </button>
        </div>
      </header>
      <WalletStaffScanner />
    </main>
  );
}
