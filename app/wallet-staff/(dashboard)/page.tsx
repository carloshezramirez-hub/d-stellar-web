import Link from "next/link";
import { ConsoleShell } from "@/components/admin/console-shell";
import { WalletStaffScanner } from "@/components/wallet-staff/scanner";

export default function WalletStaffPage() {
  return (
    <main className="min-h-screen">
      <ConsoleShell />
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">Fidelidad</p>
          <Link href="/wallet-staff/clientes" className="text-xs text-stellar-white/60 underline underline-offset-4">
            Ver clientes →
          </Link>
        </div>
        <WalletStaffScanner />
      </div>
    </main>
  );
}
