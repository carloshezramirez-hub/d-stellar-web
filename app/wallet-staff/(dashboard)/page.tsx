import { ConsoleShell } from "@/components/admin/console-shell";
import { ClientsPanel } from "@/components/wallet-staff/clients-panel";
import { ScannerPanel } from "@/components/wallet-staff/scanner-panel";

export default function WalletStaffPage() {
  return (
    <main className="min-h-screen">
      <ConsoleShell />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <p className="mb-6 font-tag text-xs font-bold tracking-widest text-stellar-white/40 uppercase">Fidelidad</p>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="order-last lg:order-first">
            <ClientsPanel />
          </div>
          <div className="order-first lg:order-last">
            <ScannerPanel />
          </div>
        </div>
      </div>
    </main>
  );
}
