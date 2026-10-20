"use client";

import { useState } from "react";
import { WalletStaffScanner } from "@/components/wallet-staff/scanner";

/** En escritorio el escáner siempre está visible al lado de la lista; en móvil arranca colapsado para no tapar la pantalla con la cámara. */
export function ScannerPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-3 w-full rounded border border-line px-4 py-3 text-xs font-bold uppercase tracking-widest text-stellar-white/70 lg:hidden"
      >
        {open ? "Ocultar escáner" : "📷 Escanear tarjeta"}
      </button>
      <div className={`${open ? "block" : "hidden"} lg:block`}>
        <WalletStaffScanner />
      </div>
    </div>
  );
}
