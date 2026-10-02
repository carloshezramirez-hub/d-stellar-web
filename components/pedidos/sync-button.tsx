"use client";

import { useState, useTransition } from "react";
import { syncHistoricalOrders, type SyncResult } from "@/app/pedidos/(dashboard)/actions";

export function SyncButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<SyncResult | null>(null);

  function handleSync() {
    setResult(null);
    startTransition(async () => {
      setResult(await syncHistoricalOrders());
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleSync}
        disabled={pending}
        className="border border-line px-4 py-2 text-xs font-bold uppercase tracking-widest text-stellar-white/80 transition-colors hover:border-stellar-pink hover:text-stellar-pink disabled:opacity-50"
      >
        {pending ? "Sincronizando…" : "Sincronizar con Mercado Pago"}
      </button>
      {result && (
        <p className="text-xs text-stellar-white/60">
          {result.ok
            ? `Revisados ${result.scanned} pagos · ${result.inserted} nuevos · ${result.skipped} ya existían${result.unrecognized ? ` · ${result.unrecognized} sin reconocer` : ""}`
            : `Error: ${result.error}`}
        </p>
      )}
    </div>
  );
}
